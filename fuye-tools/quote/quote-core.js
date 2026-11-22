/* 接单报价计算器 —— 核心计算逻辑（无 DOM 依赖，浏览器与 Node 通用）
 *
 * 设计原则：只做算术。报价 = 你真实要花的时间 × 你要的时薪 + 成本，再把平台抽成和税倒算回去。
 * 不预测客户会不会接受这个价——那件事只能去谈。
 */
(function (root) {
  function num(v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function money(n) { return "¥" + r2(n).toFixed(2); }
  function ceilTo(n, step) { return step > 0 ? Math.ceil(n / step - 1e-9) * step : n; }
  function pct(v, dflt) { var s = String(v == null ? "" : v).trim(); return s === "" ? dflt : Math.max(0, num(s)); }

  function calculate(raw) {
    raw = raw || {};
    var hours = Math.max(0, num(raw.hours));
    var rate = Math.max(0, num(raw.rate));
    var minRate = String(raw.minRate == null ? "" : raw.minRate).trim() === "" ? rate : Math.max(0, num(raw.minRate));
    var commPct = pct(raw.commPct, 20);
    var revisions = Math.max(0, num(raw.revisions));
    var revisionHours = Math.max(0, num(raw.revisionHours));
    var directCost = Math.max(0, num(raw.directCost));
    var feePct = pct(raw.feePct, 0);
    var taxPct = pct(raw.taxPct, 0);
    var bufferPct = pct(raw.bufferPct, 15);
    var depositPct = Math.min(100, pct(raw.depositPct, 50));
    var budget = Math.max(0, num(raw.budget));

    var errors = [];
    if (hours <= 0) errors.push("预计制作工时必须大于 0");
    if (rate <= 0) errors.push("期望时薪必须大于 0");
    if (feePct + taxPct >= 100) errors.push("平台抽成 + 税费不能达到 100%");
    if (errors.length) return { error: errors };

    var keep = 1 - (feePct + taxPct) / 100;          // 每收 1 元实际留下多少
    var commHours = r2(hours * commPct / 100);
    var revHours = r2(revisions * revisionHours);
    var totalHours = r2(hours + commHours + revHours);

    var labor = r2(totalHours * rate);
    var net = r2((labor + directCost) * (1 + bufferPct / 100));   // 想到手的钱
    var quote = r2(net / keep);                                     // 对客户报价
    var quoteRounded = ceilTo(quote, quote >= 1000 ? 50 : 10);
    var floorNet = r2(totalHours * minRate + directCost);           // 不含缓冲、按最低时薪
    var floor = r2(floorNet / keep);
    var deposit = r2(quoteRounded * depositPct / 100);

    var res = {
      hours: r2(hours), rate: r2(rate), minRate: r2(minRate), commPct: commPct, revisions: revisions,
      revisionHours: r2(revisionHours), directCost: r2(directCost), feePct: feePct, taxPct: taxPct,
      bufferPct: bufferPct, depositPct: depositPct, budget: r2(budget),
      commHours: commHours, revHours: revHours, totalHours: totalHours, labor: labor,
      net: net, quote: quote, quoteRounded: quoteRounded, floor: floor, deposit: deposit,
      platformCut: r2(quoteRounded * (1 - keep)),
      perRevision: r2(revisionHours * rate / keep),
      budgetVerdict: null, budgetHourly: null, notes: []
    };

    if (budget > 0) {
      res.budgetHourly = r2((budget * keep - directCost) / totalHours);
      res.budgetVerdict = budget >= quoteRounded ? "ok" : (budget >= floor ? "negotiate" : "reject");
      if (res.budgetVerdict === "ok") res.notes.push("客户预算覆盖你的报价，可以接。把交付范围和修改次数写进确认消息。");
      else if (res.budgetVerdict === "negotiate") res.notes.push("预算在最低价和报价之间：可以接，但用「砍范围」换价格（少一轮修改、少一个交付物），别直接降价。");
      else res.notes.push("预算低于你的最低接单价，按这个价做，真实时薪只有 " + money(res.budgetHourly) + "/小时。建议拒绝，或把范围砍到预算能覆盖的程度。");
    }
    if (commPct === 0) res.notes.push("沟通时间填了 0。实际接单里需求确认、来回消息通常占不少时间，建议至少按 10%–20% 估。");
    if (revisions === 0) res.notes.push("没算修改轮次。报价里写明「含 N 轮修改，超出每轮 " + money(r2(revisionHours * rate / keep) || rate / keep) + "」，能挡掉无限返工。");
    else res.notes.push("报价单写明：含 " + revisions + " 轮修改，超出按每轮 " + money(res.perRevision) + " 另计。");
    if (keep < 1) res.notes.push("平台抽成和税已经倒算进报价：报 " + money(quoteRounded) + "，扣掉约 " + money(res.platformCut) + " 后到手不少于目标。");
    res.notes.push("先收 " + depositPct + "% 定金（" + money(deposit) + "）再开工，是避免白干最便宜的办法。");
    res.notes.push("本工具只对你填的数字做算术，不预测客户是否接受，也不构成收益承诺。");
    return res;
  }

  function toMarkdown(res, label) {
    if (!res || res.error) return "（输入有误，未生成）";
    var L = [];
    L.push("# 接单报价测算 · " + (label || "未命名"));
    L.push("");
    L.push("## 工时拆解");
    L.push("- 制作：" + res.hours + " 小时");
    L.push("- 沟通（" + res.commPct + "%）：" + res.commHours + " 小时");
    L.push("- 修改（" + res.revisions + " 轮 × " + res.revisionHours + " 小时）：" + res.revHours + " 小时");
    L.push("- **合计：" + res.totalHours + " 小时**");
    L.push("");
    L.push("## 价格");
    L.push("- **建议报价：" + money(res.quoteRounded) + "**（精确值 " + money(res.quote) + "）");
    L.push("- 最低接单价：" + money(res.floor) + "（低于这个价不接）");
    L.push("- 定金 " + res.depositPct + "%：" + money(res.deposit));
    L.push("- 超出修改：每轮 " + money(res.perRevision));
    L.push("- 参数：时薪 " + money(res.rate) + "、直接成本 " + money(res.directCost) + "、平台抽成 " + res.feePct + "%、税 " + res.taxPct + "%、风险缓冲 " + res.bufferPct + "%");
    if (res.budgetVerdict) {
      L.push("");
      L.push("## 客户预算 " + money(res.budget));
      L.push("- 结论：" + ({ ok: "可以接", negotiate: "可谈（砍范围换价格）", reject: "建议拒绝" })[res.budgetVerdict]);
      L.push("- 按此预算的真实时薪：" + money(res.budgetHourly) + "/小时");
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
  else root.QuoteCore = api;
})(this);
