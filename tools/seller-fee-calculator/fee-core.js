/* Seller fee & profit calculator - core logic (no DOM; browser and Node).
 * No platform rates are hard-coded: fees change often, so the user enters the current rates.
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
    var price = Math.max(0, num(raw.price));
    var shippingCharged = Math.max(0, num(raw.shippingCharged));
    var itemCost = Math.max(0, num(raw.itemCost));
    var shippingCost = Math.max(0, num(raw.shippingCost));
    var listingFee = Math.max(0, num(raw.listingFee));
    var salePct = Math.max(0, num(raw.salePct));
    var payPct = Math.max(0, num(raw.payPct));
    var payFixed = Math.max(0, num(raw.payFixed));
    var adPct = Math.max(0, num(raw.adPct));
    var targetProfit = Math.max(0, num(raw.targetProfit));
    var errors = [];
    if (price <= 0) errors.push("Item price must be greater than 0");
    if (salePct + payPct + adPct >= 100) errors.push("Percentage fees cannot reach 100%");
    if (errors.length) return { error: errors };

    var gross = r2(price + shippingCharged);
    var pctTotal = (salePct + payPct + adPct) / 100;
    var saleFee = r2(gross * salePct / 100);
    var payFee = r2(gross * payPct / 100 + payFixed);
    var adFee = r2(gross * adPct / 100);
    var totalFees = r2(saleFee + payFee + adFee + listingFee);
    var payout = r2(gross - totalFees);
    var profit = r2(payout - itemCost - shippingCost);
    var fixedOut = listingFee + payFixed + itemCost + shippingCost - shippingCharged * (1 - pctTotal);
    // Fees are rounded one by one, so the exact answer can sit a few cents either side of the algebraic one:
    // start just below it and take the first price that reaches the target with the same rounding.
    var profitAt = function (p) {
      var g = r2(p + shippingCharged);
      var fees = r2(r2(g * salePct / 100) + r2(g * payPct / 100 + payFixed) + r2(g * adPct / 100) + listingFee);
      return r2(r2(g - fees) - itemCost - shippingCost);
    };
    var solve = function (target) {
      var p = Math.max(0, r2((fixedOut + target - 0.03) / (1 - pctTotal)));
      for (var i = 0; i < 20000 && profitAt(p) < r2(target); i++) p = r2(p + 0.01);
      return p;
    };
    var priceForTarget = solve(targetProfit);
    var breakEvenPrice = solve(0);
    var m = function (n) { return money(n, cur); };
    var res = {
      currency: cur, price: r2(price), shippingCharged: r2(shippingCharged), gross: gross,
      saleFee: saleFee, payFee: payFee, adFee: adFee, listingFee: r2(listingFee), totalFees: totalFees,
      feeRate: r2(totalFees / gross * 100), payout: payout, itemCost: r2(itemCost), shippingCost: r2(shippingCost),
      profit: profit, margin: r2(profit / gross * 100), targetProfit: r2(targetProfit),
      priceForTarget: priceForTarget, breakEvenPrice: breakEvenPrice, notes: []
    };
    if (profit < 0) res.notes.push("You lose " + m(-profit) + " on every sale at this price. The break-even price is " + m(res.breakEvenPrice) + ".");
    if (targetProfit > 0) res.notes.push("To keep " + m(targetProfit) + " profit per sale, price the item at " + m(res.priceForTarget) + " (same shipping charge).");
    res.notes.push("Fees are calculated on item price + shipping charged, which is how most marketplaces charge. Check your platform's current fee page and adjust if it differs.");
    res.notes.push("Taxes, currency conversion and refunds are not included.");
    return res;
  }

  function toMarkdown(res, label) {
    if (!res || res.error) return "(invalid input)";
    var m = function (n) { return money(n, res.currency); };
    return ["# Seller fees · " + (label || "Untitled"), "",
      "- Buyer pays: " + m(res.gross),
      "- Total fees: " + m(res.totalFees) + " (" + res.feeRate + "%)",
      "  - Sale fee " + m(res.saleFee) + "; payment processing " + m(res.payFee) + "; ads " + m(res.adFee) + "; listing " + m(res.listingFee),
      "- Payout: " + m(res.payout),
      "- **Profit per sale: " + m(res.profit) + "** (" + res.margin + "% margin)",
      "- Break-even price: " + m(res.breakEvenPrice),
      res.targetProfit > 0 ? "- Price for " + m(res.targetProfit) + " profit: " + m(res.priceForTarget) : "",
      "", "## Notes"].concat(res.notes.map(function (n) { return "- " + n; })).filter(function (l, i, a) { return l !== "" || a[i - 1] !== "" ; }).join("\n");
  }

  var api = { calculate: calculate, toMarkdown: toMarkdown, money: money };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FeeCore = api;
})(this);
