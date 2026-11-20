/* 平台到账计算器 —— 页面交互 */
(function () {
  var CFG = window.FEE_CONFIG, Core = window.FeeCore;
  var $ = function (id) { return document.getElementById(id); };
  var LS = "fuye_fee_overrides";
  var STATUS = { official: ["已核实（官方）", "low"], news: ["已核实（媒体转述官方公告）", "medium"], unverified: ["未核实，需自填", "high"] };
  var current = CFG.platforms[0].id;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function loadOv() { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { return {}; } }
  function saveOv(o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} }
  function plat(id) { return CFG.platforms.filter(function (p) { return p.id === id; })[0]; }
  function money(n) { return "¥" + Number(n).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function renderTabs() {
    $("tabs").innerHTML = CFG.platforms.map(function (p) {
      return '<button data-id="' + p.id + '" class="' + (p.id === current ? "active" : "") + '">' + esc(p.name) + "</button>";
    }).join("");
  }

  function renderForm() {
    var p = plat(current), ov = loadOv()[current] || {};
    $("pdesc").textContent = p.desc;
    $("inputs").innerHTML = p.inputs.map(function (f) {
      if (f.type === "select") {
        return '<div class="field"><label for="in-' + f.key + '">' + esc(f.label) + '</label><select id="in-' + f.key + '">' +
          f.options.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === f.def ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></div>";
      }
      return '<div class="field"><label for="in-' + f.key + '">' + esc(f.label) + '</label><input type="number" step="any" min="0" id="in-' + f.key + '" value="' + (f.def == null ? "" : f.def) + '" placeholder="请填写"></div>';
    }).join("");
    $("rates").innerHTML = p.rates.map(function (r) {
      var v = ov.hasOwnProperty(r.key) ? ov[r.key] : r.value;
      var st = STATUS[r.status] || STATUS.unverified;
      return '<div class="field"><label for="rt-' + r.key + '">' + esc(r.label) + "（" + esc(r.unit) + '）<span class="tag ' + st[1] + '">' + st[0] + "</span>" +
        (ov.hasOwnProperty(r.key) ? '<span class="tag medium">已修改</span>' : "") + '</label>' +
        '<input type="number" step="any" min="0" id="rt-' + r.key + '" data-key="' + r.key + '" value="' + (v == null ? "" : v) + '" placeholder="请按你的后台填写">' +
        (r.note ? '<div class="muted">' + esc(r.note) + "</div>" : "") +
        '<div class="muted">来源：' + (r.source.url ? '<a href="' + esc(r.source.url) + '" target="_blank" rel="noopener nofollow">' + esc(r.source.title) + "</a>" : esc(r.source.title)) + "（核实日期 " + esc(r.source.date) + "）</div></div>";
    }).join("");
    calc();
  }

  function collect() {
    var p = plat(current), inputs = {}, rates = {};
    p.inputs.forEach(function (f) { inputs[f.key] = $("in-" + f.key).value; });
    p.rates.forEach(function (r) { var v = $("rt-" + r.key).value; rates[r.key] = v === "" ? null : v; });
    return { inputs: inputs, rates: rates };
  }

  function calc() {
    var d = collect(), p = plat(current), res = Core.calculate(current, d.inputs, d.rates);
    if (res.error) {
      var names = res.error.map(function (k) {
        var r = p.rates.filter(function (x) { return x.key === k; })[0];
        var f = p.inputs.filter(function (x) { return x.key === k; })[0];
        return (r && r.label) || (f && f.label) || k;
      });
      $("out").innerHTML = '<p class="notice">请先填写：' + esc(names.join("、")) + "。未核实的费率不提供默认值，请按你的平台后台数据填写。</p>";
      return;
    }
    $("out").innerHTML =
      '<div class="grid"><div><div class="muted">' + esc(res.grossLabel) + '</div><div style="font-size:20px;font-weight:600">' + money(res.gross) + '</div></div>' +
      '<div><div class="muted">费用合计（占 ' + res.feeRatio + '%）</div><div style="font-size:20px;font-weight:600;color:var(--high)">' + money(res.totalFee) + '</div></div>' +
      '<div><div class="muted">预计到账（税前）</div><div class="big">' + money(res.net) + "</div></div></div>" +
      '<table style="margin-top:12px"><tr><th>费用项</th><th>金额</th></tr>' +
      res.lines.map(function (l) { return "<tr><td>" + esc(l.label) + "</td><td>" + money(l.amount) + "</td></tr>"; }).join("") + "</table>" +
      res.notes.map(function (n) { return '<p class="muted">注：' + esc(n) + "</p>"; }).join("");
  }

  function renderSources() {
    var rows = [];
    CFG.platforms.forEach(function (p) {
      p.rates.forEach(function (r) {
        var st = STATUS[r.status] || STATUS.unverified;
        rows.push("<tr><td>" + esc(p.name) + "</td><td>" + esc(r.label) + "</td><td>" + (r.value == null ? "—（自填）" : esc(r.value + r.unit)) + '</td><td><span class="tag ' + st[1] + '">' + st[0] + "</span></td><td>" +
          (r.source.url ? '<a href="' + esc(r.source.url) + '" target="_blank" rel="noopener nofollow">' + esc(r.source.title) + "</a>" : esc(r.source.title)) + "<br><span class=\"muted\">" + esc(r.source.date) + "</span></td></tr>");
      });
    });
    $("sources").innerHTML = "<table><tr><th>平台</th><th>项目</th><th>默认值</th><th>状态</th><th>来源与核实日期</th></tr>" + rows.join("") + "</table>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderTabs(); renderForm(); renderSources();
    $("tabs").addEventListener("click", function (e) {
      var id = e.target.getAttribute && e.target.getAttribute("data-id");
      if (!id) return; current = id; renderTabs(); renderForm();
    });
    $("inputs").addEventListener("input", calc);
    $("inputs").addEventListener("change", calc);
    $("rates").addEventListener("input", function (e) {
      var key = e.target.getAttribute("data-key"); if (!key) return;
      var ov = loadOv(); ov[current] = ov[current] || {};
      ov[current][key] = e.target.value === "" ? null : parseFloat(e.target.value);
      saveOv(ov); calc();
    });
    $("btn-reset").addEventListener("click", function () {
      var ov = loadOv(); delete ov[current]; saveOv(ov); renderForm();
    });
    $("checked").textContent = CFG.checked;
    if (window.SiteFooter) window.SiteFooter.render();
  });
})();
