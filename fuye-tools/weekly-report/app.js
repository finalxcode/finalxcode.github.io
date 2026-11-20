/* 副业周报生成器 —— 页面交互 */
(function () {
  var Core = window.ReportCore;
  var LS_KEY = "fuye_weekly_v1";
  var ROWS = 7;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function today(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + (offsetDays || 0));
    var m = ("0" + (d.getMonth() + 1)).slice(-2), day = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function rowHtml(r) {
    r = r || {};
    return '<tr>' +
      '<td><input type="text" class="c-date" value="' + esc(r.date || "") + '" placeholder="2026-11-16"></td>' +
      '<td><input type="text" class="c-tag" value="' + esc(r.tag || "") + '" placeholder="例：公众号 / 闲鱼"></td>' +
      '<td class="num"><input type="number" min="0" step="5" class="c-min" value="' + esc(r.minutes == null ? "" : r.minutes) + '"></td>' +
      '<td class="num"><input type="number" min="0" step="0.01" class="c-spend" value="' + esc(r.spend == null ? "" : r.spend) + '"></td>' +
      '<td class="num"><input type="number" min="0" step="0.01" class="c-income" value="' + esc(r.income == null ? "" : r.income) + '"></td>' +
      '</tr>';
  }

  function addRow(r) {
    var tb = $("rows");
    tb.insertAdjacentHTML("beforeend", rowHtml(r));
    bindRow(tb.lastElementChild);
  }

  function bindRow(tr) {
    Array.prototype.forEach.call(tr.querySelectorAll("input"), function (i) {
      i.addEventListener("input", function () { readAndSum(); });
    });
  }

  function readRows() {
    var out = [];
    Array.prototype.forEach.call($("rows").querySelectorAll("tr"), function (tr) {
      out.push({
        date: tr.querySelector(".c-date").value,
        tag: tr.querySelector(".c-tag").value,
        minutes: tr.querySelector(".c-min").value,
        spend: tr.querySelector(".c-spend").value,
        income: tr.querySelector(".c-income").value
      });
    });
    return out;
  }

  function current() {
    return Core.normalize(readRows());
  }

  function readAndSum() {
    var rows = current(), t = Core.totals(rows);
    $("sum").innerHTML = rows.length === 0
      ? '<span class="muted">还没填。先记一天，哪怕收入是 0。</span>'
      : '合计 <b>' + t.hours + '</b> 小时 · 支出 <b>' + Core.money(t.spend) + '</b> · 收入 <b>' + Core.money(t.income) +
        '</b> · 净额 <b>' + Core.money(t.net) + '</b>' + (t.income > 0 ? ' · 折合 <b>' + Core.money(t.hourly) + '/小时</b>' : '');
    save();
    return { rows: rows, t: t };
  }

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ rows: readRows(), notes: $("notes").value }));
    } catch (e) { /* 隐私模式下会失败，忽略 */ }
  }

  function restore() {
    var raw;
    try { raw = localStorage.getItem(LS_KEY); } catch (e) { raw = null; }
    var data = null;
    if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
    var rows = (data && data.rows && data.rows.length) ? data.rows : null;
    if (rows) {
      rows.forEach(function (r) { addRow(r); });
    } else {
      for (var i = 0; i < ROWS; i++) addRow({});
    }
    if (data && data.notes) $("notes").value = data.notes;
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function generate() {
    var rows = current();
    if (!rows.length) {
      $("hint").textContent = "先在上面填至少一行数字。";
      $("out").style.display = "none";
      return null;
    }
    var md = Core.toMarkdown(rows, $("notes").value);
    $("out").textContent = md;
    $("out").style.display = "block";
    $("hint").textContent = "已生成。周报里的结论只依据你填的数字。";
    save();
    return md;
  }

  document.addEventListener("DOMContentLoaded", function () {
    restore();
    readAndSum();

    $("btn-add").addEventListener("click", function () { addRow({}); readAndSum(); });
    $("btn-week").addEventListener("click", function () {
      var trs = $("rows").querySelectorAll("tr");
      var start = new Date();
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // 本周一
      Array.prototype.forEach.call(trs, function (tr, i) {
        var d = new Date(start); d.setDate(start.getDate() + i);
        var m = ("0" + (d.getMonth() + 1)).slice(-2), day = ("0" + d.getDate()).slice(-2);
        tr.querySelector(".c-date").value = d.getFullYear() + "-" + m + "-" + day;
      });
      readAndSum();
    });
    $("btn-clear").addEventListener("click", function () {
      $("rows").innerHTML = "";
      for (var i = 0; i < ROWS; i++) addRow({});
      $("notes").value = "";
      $("out").style.display = "none";
      $("hint").textContent = "";
      readAndSum();
    });
    $("notes").addEventListener("input", save);
    $("btn-gen").addEventListener("click", generate);
    $("btn-copy").addEventListener("click", function () {
      var md = $("out").textContent || generate();
      if (!md) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(function () { $("hint").textContent = "已复制到剪贴板。"; },
          function () { $("hint").textContent = "复制被浏览器拦住了，请手动选中复制。"; });
      } else {
        $("hint").textContent = "这个浏览器不支持自动复制，请手动选中复制。";
      }
    });
    $("btn-md").addEventListener("click", function () {
      var md = $("out").textContent || generate();
      if (md) download("fuye-weekly-" + today() + ".md", md, "text/markdown;charset=utf-8");
    });
    $("btn-csv").addEventListener("click", function () {
      var rows = current();
      if (!rows.length) { $("hint").textContent = "先填数据再导出。"; return; }
      download("fuye-weekly-" + today() + ".csv", "\ufeff" + Core.toCsv(rows), "text/csv;charset=utf-8");
    });
  });
})();
