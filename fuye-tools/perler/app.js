/* 拼豆图纸生成器 —— 页面交互（图片只在本机浏览器处理，不上传） */
(function () {
  var Core = window.PerlerCore;
  var palette = Core.preparePalette(window.PERLER_PALETTE);
  var src = null, last = null, timer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function hint(t) { $("hint").textContent = t || ""; }
  function saveBlob(name, blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function opts() {
    return {
      width: parseInt($("width").value, 10) || 52,
      maxColors: parseInt($("maxColors").value, 10) || 0,
      board: parseInt($("board").value, 10) || 0,
      dither: $("dither").checked, whiteAsEmpty: $("whiteEmpty").checked,
      pixelArt: $("pixelArt").checked, showCodes: $("showCodes").checked, cleanRare: $("cleanRare").checked
    };
  }
  function setSource(img) {
    var s = Math.min(1, 1200 / Math.max(img.width, img.height));
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    src = c; render();
  }
  function loadFile(f) {
    if (!f) return;
    if (!/^image\//.test(f.type)) { hint("请选择图片文件（PNG / JPG / WebP）。"); return; }
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function () { URL.revokeObjectURL(url); setSource(img); hint("已载入：" + f.name); };
    img.onerror = function () { hint("这张图读不出来，换一张试试。"); };
    img.src = url;
  }
  function sample() {
    var c = document.createElement("canvas"); c.width = c.height = 240;
    var x = c.getContext("2d");
    x.fillStyle = "#A9D5F2"; x.beginPath(); x.arc(120, 120, 110, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#D7262E"; x.beginPath(); x.moveTo(120, 190);
    x.bezierCurveTo(20, 120, 60, 40, 120, 85); x.bezierCurveTo(180, 40, 220, 120, 120, 190); x.fill();
    x.fillStyle = "#FFFFFF"; x.beginPath(); x.arc(92, 95, 12, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#F8D21C"; x.beginPath(); x.arc(190, 52, 18, 0, Math.PI * 2); x.fill();
    src = c; render();
    hint("已载入示例图（爱心）。换成你自己的图再看效果。");
  }
  function hline(x, x1, y1, x2, y2, col, lw) { x.strokeStyle = col; x.lineWidth = lw || 1; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); }
  function drawPattern(cv, res, cs, codes, board, footer) {
    var w = res.w, h = res.h, fh = footer ? 44 : 0;
    cv.width = w * cs + 1; cv.height = h * cs + 1 + fh;
    var x = cv.getContext("2d"), i, j;
    x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height);
    x.font = Math.max(7, Math.floor(cs * 0.36)) + "px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    for (j = 0; j < h; j++) for (i = 0; i < w; i++) {
      var k = res.grid[j * w + i];
      x.fillStyle = k < 0 ? (((i + j) % 2) ? "#f1f3f4" : "#e6e9eb") : res.palette[k].hex;
      x.fillRect(i * cs, j * cs, cs, cs);
      if (codes && k >= 0) {
        var p = res.palette[k];
        x.fillStyle = p.lab[0] > 60 ? "#000" : "#fff";
        x.fillText(p.code, i * cs + cs / 2, j * cs + cs / 2 + 0.5);
      }
    }
    for (i = 0; i <= w; i++) hline(x, i * cs + 0.5, 0, i * cs + 0.5, h * cs, i % 10 === 0 ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.12)");
    for (j = 0; j <= h; j++) hline(x, 0, j * cs + 0.5, w * cs, j * cs + 0.5, j % 10 === 0 ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.12)");
    if (board > 0) {
      for (i = 0; i <= w; i += board) hline(x, i * cs + 0.5, 0, i * cs + 0.5, h * cs, "#1f6feb", 2);
      for (j = 0; j <= h; j += board) hline(x, 0, j * cs + 0.5, w * cs, j * cs + 0.5, "#1f6feb", 2);
    }
    if (footer) {
      x.font = "14px sans-serif"; x.textBaseline = "middle";
      x.textAlign = "left"; x.fillStyle = "#37474f";
      x.fillText(w + "×" + h + " 颗 · " + res.counts.length + " 色 · 共 " + res.total + " 颗", 8, h * cs + fh / 2);
      x.textAlign = "right"; x.fillStyle = "#90a4ae";
      x.fillText("副业实验账本 · 免费拼豆图纸生成器", cv.width - 8, h * cs + fh / 2);
    }
  }
  function kv(a, b) { return '<div class="kv"><span>' + esc(a) + "</span><b>" + esc(b) + "</b></div>"; }
  function render() {
    if (!src) return;
    var o = opts(), g = Core.gridSize(src.width, src.height, o.width);
    var t = document.createElement("canvas"); t.width = g.w; t.height = g.h;
    var tx = t.getContext("2d");
    tx.imageSmoothingEnabled = !o.pixelArt; tx.imageSmoothingQuality = "high";
    tx.drawImage(src, 0, 0, g.w, g.h);
    var res = Core.quantize(tx.getImageData(0, 0, g.w, g.h).data, g.w, g.h, palette,
      { maxColors: o.maxColors, dither: o.dither, whiteAsEmpty: o.whiteAsEmpty, cleanRare: o.cleanRare });
    if (res.error) { hint(res.error); return; }
    last = { res: res, o: o };
    var cs = Math.max(8, Math.min(24, Math.floor(960 / g.w)));
    drawPattern($("pattern"), res, cs, o.showCodes && cs >= 14, o.board, false);
    var b = Core.boards(res.w, res.h, o.board);
    $("stats").innerHTML = '<div class="kvgrid">' +
      kv("尺寸", res.w + " × " + res.h + " 颗") + kv("实际用豆", res.total + " 颗") +
      kv("颜色", res.counts.length + " 种") +
      kv("拼板", o.board ? b.cols + " × " + b.rows + " = " + b.total + " 块（" + o.board + "×" + o.board + "）" : "—") +
      kv("成品约（5mm 豆）", (res.w * 0.5).toFixed(1) + " × " + (res.h * 0.5).toFixed(1) + " cm") +
      kv("留空格", res.empty + " 格") + "</div>" +
      (o.showCodes && cs < 14 ? '<p class="muted">图纸较宽，屏幕上放不下色号；下载的 PNG 里每格都有色号。</p>' : "");
    var rows = res.counts.map(function (c) {
      return "<tr><td><span class=\"sw\" style=\"background:" + c.hex + "\"></span> " + esc(c.code) + "</td><td>" + esc(c.name) +
        "</td><td>" + c.count + "</td><td>" + Math.ceil(c.count * 1.1) + "</td></tr>";
    }).join("");
    $("list").innerHTML = '<table class="list"><thead><tr><th>色号</th><th>名称</th><th>数量</th><th>建议备货 +10%</th></tr></thead><tbody>' +
      rows + '</tbody><tfoot><tr><td colspan="2">合计</td><td>' + res.total + "</td><td></td></tr></tfoot></table>";
  }
  function later() { clearTimeout(timer); timer = setTimeout(render, 120); }

  document.addEventListener("DOMContentLoaded", function () {
    $("file").addEventListener("change", function (e) { loadFile(e.target.files && e.target.files[0]); });
    var drop = $("drop");
    ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("on"); }); });
    ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("on"); }); });
    drop.addEventListener("drop", function (e) { loadFile(e.dataTransfer && e.dataTransfer.files[0]); });
    $("btn-sample").addEventListener("click", sample);
    ["width", "maxColors", "board", "dither", "whiteEmpty", "pixelArt", "showCodes", "cleanRare"].forEach(function (id) {
      $(id).addEventListener("input", later); $(id).addEventListener("change", later);
    });
    $("btn-png").addEventListener("click", function () {
      if (!last) { hint("先选一张图。"); return; }
      var cv = document.createElement("canvas");
      drawPattern(cv, last.res, 20, true, last.o.board, true);
      cv.toBlob(function (b) { saveBlob("拼豆图纸-" + last.res.w + "x" + last.res.h + ".png", b); });
    });
    $("btn-csv").addEventListener("click", function () {
      if (!last) { hint("先选一张图。"); return; }
      saveBlob("拼豆用料清单.csv", new Blob(["\ufeff" + Core.toCSV(last.res)], { type: "text/csv;charset=utf-8" }));
    });
    $("btn-print").addEventListener("click", function () { if (!last) { hint("先选一张图。"); return; } window.print(); });
    $("btn-palette").addEventListener("click", function () {
      var r = Core.parsePaletteCSV($("palette-text").value), p = Core.preparePalette(r.palette);
      if (p.length < 2) { hint("色卡至少要 2 个有效颜色。每行格式：色号,名称,#色值"); return; }
      palette = p; render();
      hint("已换成你的色卡：" + p.length + " 色" + (r.errors.length ? "（第 " + r.errors.join("、") + " 行格式不对，已跳过）" : "") + "。");
    });
    $("btn-palette-reset").addEventListener("click", function () {
      palette = Core.preparePalette(window.PERLER_PALETTE); render(); hint("已恢复通用 48 色。");
    });
  });
})();
