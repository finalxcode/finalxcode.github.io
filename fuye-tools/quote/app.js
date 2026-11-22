/* 接单报价计算器 —— 页面交互 */
(function () {
  var Core = window.QuoteCore;
  var LS_KEY = "fuye_quote_v1";
  var FIELDS = ["label", "hours", "rate", "minRate", "commPct", "revisions", "revisionHours", "directCost", "feePct", "taxPct", "bufferPct", "depositPct", "budget"];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function read() {
    var o = {};
    FIELDS.forEach(function (k) { o[k] = $(k).value; });
    return o;
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(read())); } catch (e) { /* 隐私模式忽略 */ }
  }
  function restore() {
    var raw = null;
    try { raw = localStorage.getItem(LS_KEY); } catch (e) { raw = null; }
    if (!raw) return;
    var data = null;
    try { data = JSON.parse(raw); } catch (e) { data = null; }
    if (!data) return;
    FIELDS.forEach(function (k) { if (data[k] != null) $(k).value = data[k]; });
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function line(label, value, cls) {
    return '<div class="kv"><span>' + esc(label) + '</span><b class="' + (cls || "") + '">' + esc(value) + "</b></div>";
  }

  function render() {
    var res = Core.calculate(read());
    var box = $("result");
    if (res.error) {
      box.innerHTML = '<p class="notice">' + esc(res.error.join("；")) + "</p>";
      return res;
    }
    var h = "";
    h += '<div class="headline"><span class="big">建议报价 ' + Core.money(res.quoteRounded) + "</span>";
    h += '<span class="muted">最低接单价 ' + Core.money(res.floor) + "，低于这个价不接</span></div>";
    h += '<div class="kvgrid">';
    h += line("真实总工时", res.totalHours + " 小时");
    h += line("其中沟通 / 修改", res.commHours + " / " + res.revHours + " 小时");
    h += line("想到手", Core.money(res.net));
    h += line("平台抽成 + 税", Core.money(res.platformCut));
    h += line("定金 " + res.depositPct + "%", Core.money(res.deposit));
    h += line("超出修改每轮", Core.money(res.perRevision));
    if (res.budgetVerdict) {
      var v = { ok: ["可以接", "pos"], negotiate: ["可谈：砍范围换价格", ""], reject: ["建议拒绝", "neg"] }[res.budgetVerdict];
      h += line("客户预算结论", v[0], v[1]);
      h += line("按预算的真实时薪", Core.money(res.budgetHourly) + "/小时", res.budgetHourly < res.minRate ? "neg" : "pos");
    }
    h += "</div>";
    h += '<ul class="insight notes">';
    (res.notes || []).forEach(function (n) { h += "<li>" + esc(n) + "</li>"; });
    h += "</ul>";
    box.innerHTML = h;
    return res;
  }

  document.addEventListener("DOMContentLoaded", function () {
    restore();
    FIELDS.forEach(function (k) { $(k).addEventListener("input", function () { render(); save(); }); });

    $("btn-demo").addEventListener("click", function () {
      var demo = {
        label: "示例：公众号排版代做（数字为举例）", hours: "6", rate: "80", minRate: "50", commPct: "20",
        revisions: "2", revisionHours: "1", directCost: "30", feePct: "0", taxPct: "0", bufferPct: "15",
        depositPct: "50", budget: "600"
      };
      FIELDS.forEach(function (k) { $(k).value = demo[k]; });
      render(); save();
      $("hint").textContent = "已填入示例数据。所有数字都是举例，换成你自己的再判断。";
    });
    $("btn-clear").addEventListener("click", function () {
      FIELDS.forEach(function (k) { $(k).value = ""; });
      $("out").style.display = "none";
      $("hint").textContent = "";
      render(); save();
    });
    $("btn-gen").addEventListener("click", function () {
      var res = Core.calculate(read());
      if (res.error) { $("hint").textContent = res.error.join("；"); return; }
      var md = Core.toMarkdown(res, $("label").value.trim());
      $("out").textContent = md;
      $("out").style.display = "block";
      $("hint").textContent = "已生成。结论只依据你填的数字，不含收益预测。";
      save();
    });
    $("btn-copy").addEventListener("click", function () {
      var t = $("out").textContent;
      if (!t) { $("hint").textContent = "先点「生成报告」。"; return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { $("hint").textContent = "已复制。"; }, function () { $("hint").textContent = "复制失败，请手动选中。"; });
      } else {
        $("hint").textContent = "当前环境不支持自动复制，请手动选中。";
      }
    });
    $("btn-md").addEventListener("click", function () {
      var t = $("out").textContent;
      if (!t) { $("hint").textContent = "先点「生成报告」。"; return; }
      download("接单报价.md", t, "text/markdown;charset=utf-8");
    });

    render();
  });
})();
