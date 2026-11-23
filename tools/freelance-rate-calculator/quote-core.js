/* Freelance rate / project quote calculator - core logic (no DOM; browser and Node).
 * Arithmetic only: quote = real hours x your rate + costs, grossed up for platform fees and tax.
 */
(function (root) {
  function num(v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function money(n, cur) { return (cur || "$") + r2(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function ceilTo(n, step) { return step > 0 ? Math.ceil(n / step - 1e-9) * step : n; }
  function pct(v, dflt) { var s = String(v == null ? "" : v).trim(); return s === "" ? dflt : Math.max(0, num(s)); }

  function calculate(raw) {
    raw = raw || {};
    var cur = raw.currency || "$";
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
    if (hours <= 0) errors.push("Production hours must be greater than 0");
    if (rate <= 0) errors.push("Hourly rate must be greater than 0");
    if (feePct + taxPct >= 100) errors.push("Platform fee + tax cannot reach 100%");
    if (errors.length) return { error: errors };

    var keep = 1 - (feePct + taxPct) / 100;
    var commHours = r2(hours * commPct / 100);
    var revHours = r2(revisions * revisionHours);
    var totalHours = r2(hours + commHours + revHours);
    var labor = r2(totalHours * rate);
    var net = r2((labor + directCost) * (1 + bufferPct / 100));
    var quote = r2(net / keep);
    var quoteRounded = ceilTo(quote, quote >= 1000 ? 50 : 10);
    var floor = r2((totalHours * minRate + directCost) / keep);
    var deposit = r2(quoteRounded * depositPct / 100);
    var m = function (n) { return money(n, cur); };

    var res = {
      currency: cur, hours: r2(hours), rate: r2(rate), minRate: r2(minRate), commPct: commPct, revisions: revisions,
      revisionHours: r2(revisionHours), directCost: r2(directCost), feePct: feePct, taxPct: taxPct,
      bufferPct: bufferPct, depositPct: depositPct, budget: r2(budget),
      commHours: commHours, revHours: revHours, totalHours: totalHours, labor: labor,
      net: net, quote: quote, quoteRounded: quoteRounded, floor: floor, deposit: deposit,
      platformCut: r2(quoteRounded * (1 - keep)),
      perRevision: r2(revisionHours * rate / keep),
      effectiveHourly: r2((quoteRounded * keep - directCost) / totalHours),
      budgetVerdict: null, budgetHourly: null, notes: []
    };
    if (budget > 0) {
      res.budgetHourly = r2((budget * keep - directCost) / totalHours);
      res.budgetVerdict = budget >= quoteRounded ? "ok" : (budget >= floor ? "negotiate" : "reject");
      if (res.budgetVerdict === "ok") res.notes.push("The client's budget covers your quote. Put the scope and number of revisions in writing.");
      else if (res.budgetVerdict === "negotiate") res.notes.push("The budget is between your floor and your quote: accept only if you cut scope (one less revision, one less deliverable) instead of cutting your rate.");
      else res.notes.push("The budget is below your floor. At this price you would earn " + m(res.budgetHourly) + "/hour. Decline, or reduce the scope until the budget covers it.");
    }
    if (commPct === 0) res.notes.push("You set communication time to 0. Briefs, emails and calls usually take 10–20% of the project.");
    if (revisions === 0) res.notes.push("No revisions included. State in the proposal that extra revision rounds are billed separately.");
    else res.notes.push("Write in the proposal: " + revisions + " revision round(s) included; extra rounds " + m(res.perRevision) + " each.");
    if (keep < 1) res.notes.push("Platform fee and tax are already grossed up: quote " + m(quoteRounded) + ", about " + m(res.platformCut) + " is deducted, and you still keep your target.");
    res.notes.push("Ask for a " + depositPct + "% deposit (" + m(deposit) + ") before starting work.");
    res.notes.push("This calculator only does arithmetic on your numbers. It does not predict whether a client will accept.");
    return res;
  }

  function toMarkdown(res, label) {
    if (!res || res.error) return "(invalid input)";
    var m = function (n) { return money(n, res.currency); }, L = [];
    L.push("# Project quote · " + (label || "Untitled"), "");
    L.push("## Hours");
    L.push("- Production: " + res.hours + " h");
    L.push("- Communication (" + res.commPct + "%): " + res.commHours + " h");
    L.push("- Revisions (" + res.revisions + " × " + res.revisionHours + " h): " + res.revHours + " h");
    L.push("- **Total: " + res.totalHours + " h**", "");
    L.push("## Price");
    L.push("- **Quote: " + m(res.quoteRounded) + "** (exact " + m(res.quote) + ")");
    L.push("- Walk-away floor: " + m(res.floor));
    L.push("- Deposit " + res.depositPct + "%: " + m(res.deposit));
    L.push("- Extra revision round: " + m(res.perRevision));
    L.push("- Effective hourly rate after fees: " + m(res.effectiveHourly));
    if (res.budgetVerdict) {
      L.push("", "## Client budget " + m(res.budget));
      L.push("- Verdict: " + ({ ok: "Accept", negotiate: "Negotiate scope", reject: "Decline" })[res.budgetVerdict]);
      L.push("- Your real hourly rate at this budget: " + m(res.budgetHourly));
    }
    L.push("", "## Notes");
    res.notes.forEach(function (n) { L.push("- " + n); });
    return L.join("\n");
  }

  var api = { calculate: calculate, toMarkdown: toMarkdown, money: money };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QuoteCore = api;
})(this);
