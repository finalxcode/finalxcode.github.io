/* Break-even calculator - core logic (no DOM; browser and Node).
 * "You need X sales to break even" is arithmetic; whether you can make X sales is for you to test.
 */
(function (root) {
  function num(v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function money(n, cur) { return (n < 0 ? "-" : "") + (cur || "$") + r2(Math.abs(n)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  function calculate(raw) {
    raw = raw || {};
    var cur = raw.currency || "$";
    var price = num(raw.price);
    var variableCost = num(raw.variableCost);
    var feePct = Math.max(0, num(raw.feePct));
    var fixedCost = Math.max(0, num(raw.fixedCost));
    var targetProfit = Math.max(0, num(raw.targetProfit));
    var minutes = Math.max(0, num(raw.minutes));
    var weeklyMinutes = Math.max(0, num(raw.weeklyMinutes));
    var errors = [];
    if (price <= 0) errors.push("Price must be greater than 0");
    if (variableCost < 0) errors.push("Cost per sale cannot be negative");
    if (feePct >= 100) errors.push("Fees must be below 100%");
    if (errors.length) return { error: errors };

    var feeAmount = r2(price * feePct / 100);
    var contribution = r2(price - variableCost - feeAmount);
    var m = function (n) { return money(n, cur); };
    var res = {
      currency: cur, price: r2(price), variableCost: r2(variableCost), feePct: feePct, feeAmount: feeAmount,
      fixedCost: r2(fixedCost), targetProfit: r2(targetProfit), minutes: r2(minutes), weeklyMinutes: r2(weeklyMinutes),
      contribution: contribution, contributionRate: r2(contribution / price * 100), viable: contribution > 0,
      breakEvenQty: null, breakEvenRevenue: null, breakEvenHours: null, breakEvenWeeks: null,
      targetQty: null, targetHours: null, targetWeeks: null, hourly: null, notes: []
    };
    if (!res.viable) {
      res.notes.push(contribution < 0 ? "Every sale loses " + m(-contribution) + ". Selling more makes it worse: raise the price or cut costs before you start."
        : "Each sale leaves nothing to cover fixed costs. Change the model first.");
    } else {
      // Divide in whole cents: 1.10 / 0.10 is 11.000000000000002 in floating point.
      var cents = function (n) { return Math.round(n * 100); };
      res.breakEvenQty = Math.ceil(cents(fixedCost) / cents(contribution));
      res.breakEvenRevenue = r2(res.breakEvenQty * price);
      res.targetQty = Math.ceil((cents(fixedCost) + cents(targetProfit)) / cents(contribution));
      if (minutes > 0) {
        res.breakEvenHours = r2(res.breakEvenQty * minutes / 60);
        res.targetHours = r2(res.targetQty * minutes / 60);
        res.hourly = r2(contribution / (minutes / 60));
        if (weeklyMinutes > 0) {
          res.breakEvenWeeks = r2(res.breakEvenQty * minutes / weeklyMinutes);
          res.targetWeeks = r2(res.targetQty * minutes / weeklyMinutes);
        }
      } else {
        res.notes.push("Add the minutes each sale takes to see your real hourly rate. Time is the cost most side projects forget.");
      }
      res.notes.push("The break-even point is arithmetic, not a forecast. Whether you can make " + res.breakEvenQty + " sales is the one thing to test first.");
      if (res.breakEvenWeeks != null && res.breakEvenWeeks > 52) res.notes.push("At your weekly time budget, breaking even takes " + res.breakEvenWeeks + " weeks (over a year).");
    }
    res.notes.push("Include payment processing, marketplace fees, refunds and shipping in the cost per sale or the fee %.");
    return res;
  }

  function toMarkdown(res, label) {
    if (!res || res.error) return "(invalid input)";
    var m = function (n) { return money(n, res.currency); }, L = [];
    L.push("# Break-even · " + (label || "Untitled"), "");
    L.push("## Inputs");
    L.push("- Price: " + m(res.price));
    L.push("- Cost per sale: " + m(res.variableCost) + "; fees " + res.feePct + "% (" + m(res.feeAmount) + ")");
    L.push("- Fixed costs: " + m(res.fixedCost) + "; target profit " + m(res.targetProfit), "");
    L.push("## Result");
    if (!res.viable) L.push("- **Not viable**: contribution per sale " + m(res.contribution));
    else {
      L.push("- Contribution per sale: **" + m(res.contribution) + "** (" + res.contributionRate + "%)");
      L.push("- **Break-even: " + res.breakEvenQty + " sales** (" + m(res.breakEvenRevenue) + " revenue)");
      L.push("- Target profit: " + res.targetQty + " sales");
      if (res.hourly != null) L.push("- Real hourly rate: " + m(res.hourly));
      if (res.breakEvenWeeks != null) L.push("- Weeks to break even at your pace: " + res.breakEvenWeeks);
    }
    L.push("", "## Notes");
    res.notes.forEach(function (n) { L.push("- " + n); });
    return L.join("\n");
  }

  var api = { calculate: calculate, toMarkdown: toMarkdown, money: money };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BreakEvenCore = api;
})(this);
