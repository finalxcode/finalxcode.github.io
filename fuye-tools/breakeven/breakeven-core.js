/* 盈亏平衡测算 —— 核心计算逻辑（无 DOM 依赖，可在浏览器与 Node 中运行）
 *
 * 设计原则：只做算术和事实描述，不预测能不能卖出去、不编收益数字。
 * 「回本需要卖 X 单」是算术；「能不能卖出 X 单」必须由用户自己去验证。
 */
(function (root) {
  function num(v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function money(n) { return "¥" + r2(n).toFixed(2); }

  function calculate(raw) {
    raw = raw || {};
    var price = num(raw.price);
    var variableCost = num(raw.variableCost);
    var fixedCost = Math.max(0, num(raw.fixedCost));
    var targetProfit = Math.max(0, num(raw.targetProfit));
    var minutes = Math.max(0, num(raw.minutes));
    var weeklyMinutes = Math.max(0, num(raw.weeklyMinutes));

    var errors = [];
    if (price <= 0) errors.push("客单价必须大于 0");
    if (variableCost < 0) errors.push("单笔可变成本不能为负数");
    if (errors.length) return { error: errors };

    // 单笔边际贡献：卖一单真正能拿来分摊固定成本的钱
    var contribution = r2(price - variableCost);
    var contributionRate = price > 0 ? r2(contribution / price * 100) : 0;
    var viable = contribution > 0;

    var res = {
      price: r2(price), variableCost: r2(variableCost), fixedCost: r2(fixedCost),
      targetProfit: r2(targetProfit), minutes: r2(minutes), weeklyMinutes: r2(weeklyMinutes),
      contribution: contribution, contributionRate: contributionRate, viable: viable,
      breakEvenQty: null, breakEvenRevenue: null, breakEvenHours: null, breakEvenWeeks: null,
      targetQty: null, targetHours: null, targetWeeks: null, sustainableHourly: null,
      notes: []
    };

    if (!viable) {
      res.notes.push("每卖一单" + (contribution < 0 ? "还亏 " + money(-contribution) : "不赚不多") + "，" +
        (contribution < 0 ? "卖得越多亏得越多，先降成本或提价，别开工。" : "没有钱分摊固定成本，先改模型。"));
    } else {
      res.breakEvenQty = Math.ceil(fixedCost / contribution);
      res.breakEvenRevenue = r2(res.breakEvenQty * price);
      res.targetQty = Math.ceil((fixedCost + targetProfit) / contribution);
      if (minutes > 0) {
        res.breakEvenHours = r2(res.breakEvenQty * minutes / 60);
        res.targetHours = r2(res.targetQty * minutes / 60);
        res.sustainableHourly = r2(contribution / (minutes / 60));
        if (weeklyMinutes > 0) {
          res.breakEvenWeeks = r2(res.breakEvenQty * minutes / weeklyMinutes);
          res.targetWeeks = r2(res.targetQty * minutes / weeklyMinutes);
        }
      }
      if (fixedCost === 0) {
        res.notes.push("固定成本填 0，等于默认没有回本门槛。别忘了时间也是成本——填「每单耗时」能看到真实时薪。");
      }
      if (minutes === 0) {
        res.notes.push("没填每单耗时，无法估算工时和时薪。建议补上，时间是副业里最容易被忽略的成本。");
      }
      res.notes.push("回本线是算术，不是预测。能不能卖出 " + res.breakEvenQty + " 单，只能靠你亲自去试——这也是这类项目唯一值得先验证的事。");
      if (res.sustainableHourly != null && res.sustainableHourly < 20) {
        res.notes.push("按这个结构，长期真实时薪约 " + money(res.sustainableHourly) + "/小时。低于你能接受的水平，就该改模型或换项目。");
      }
      if (res.breakEvenWeeks != null && res.breakEvenWeeks > 52) {
        res.notes.push("按你填的每周投入，回本要 " + res.breakEvenWeeks + " 周（超过一年）。这种节奏下不如先把验证周期压短。");
      }
    }
    res.notes.push("平台手续费、退款、税费请折算进「单笔可变成本」；本工具不预测收益，只对你填的数字做算术。");
    return res;
  }

  function toMarkdown(res, label) {
    if (!res || res.error) return "（输入有误，未生成）";
    var L = [];
    L.push("# 盈亏平衡测算 · " + (label || "未命名"));
    L.push("");
    L.push("## 你填的数字");
    L.push("- 客单价：" + money(res.price));
    L.push("- 单笔可变成本：" + money(res.variableCost));
    L.push("- 一次性固定投入：" + money(res.fixedCost));
    L.push("- 目标利润：" + money(res.targetProfit));
    L.push("- 每单耗时：" + res.minutes + " 分钟");
    if (res.weeklyMinutes > 0) L.push("- 每周可投入：" + res.weeklyMinutes + " 分钟");
    L.push("");
    L.push("## 结果");
    if (!res.viable) {
      L.push("- **不可行**：单笔边际贡献 " + money(res.contribution) + "，没有回本的可能。");
    } else {
      L.push("- 单笔边际贡献：**" + money(res.contribution) + "**（贡献率 " + res.contributionRate + "%）");
      L.push("- **回本单量：" + res.breakEvenQty + " 单**（对应营收 " + money(res.breakEvenRevenue) + "）");
      L.push("- 达到目标利润：" + res.targetQty + " 单");
      if (res.breakEvenHours != null) L.push("- 回本总工时：" + res.breakEvenHours + " 小时");
      if (res.breakEvenWeeks != null) L.push("- 按当前投入：约 " + res.breakEvenWeeks + " 周回本");
      if (res.sustainableHourly != null) L.push("- 长期真实时薪：" + money(res.sustainableHourly) + "/小时");
    }
    L.push("");
    L.push("## 提醒");
    (res.notes || []).forEach(function (n) { L.push("- " + n); });
    L.push("");
    L.push("> 本工具只做算术，不预测收益、不承诺结果。");
    return L.join("\n");
  }

  var api = { calculate: calculate, toMarkdown: toMarkdown, money: money };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BreakEvenCore = api;
})(this);
