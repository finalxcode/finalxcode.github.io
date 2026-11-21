/* 盈亏平衡测算 —— 页面交互 */
(function () {
  var Core = window.BreakEvenCore;
  var LS_KEY = "fuye_breakeven_v1";
  var FIELDS = ["label", "price", "variableCost", "fixedCost", "targetProfit", "minutes", "weeklyMinutes"];

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
    h += '<div class="headline"><span class="big">' + (res.viable ? res.breakEvenQty + " 单" : "不可行") + "</span>";
    h += '<span class="muted">' + (res.viable ? "回本需要卖出的数量（算术，不是预测）" : "单笔边际贡献不为正") + "</span></div>";
    h += '<div class="kvgrid">';
    h += line("单笔边际贡献", Core.money(res.contribution) + "（" + res.contributionRate + "%）", res.viable ? "pos" : "neg");
    h += line("回本营收", res.viable ? Core.money(res.breakEvenRevenue) : "—");
    h += line("达到目标利润", res.viable ? res.targetQty + " 单" : "—");
    h += line("回本总工时", res.breakEvenHours != null ? res.breakEvenHours + " 小时" : "—");
    h += line("按当前投入", res.breakEvenWeeks != null ? "约 " + res.breakEvenWeeks + " 周" : "—（填每周可投入）");
    h += line("长期真实时薪", res.sustainableHourly != null ? Core.money(res.sustainableHourly) + "/小时" : "—（填每单耗时）");
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
        label: "示例数据（数字为举例）", price: "39.9", variableCost: "12", fixedCost: "800",
        targetProfit: "1000", minutes: "25", weeklyMinutes: "300"
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
      download("盈亏平衡测算.md", t, "text/markdown;charset=utf-8");
    });

    render();
  });
})();
