/* Shared page logic for the calculators. Each page sets window.CALC = { core, fields, storageKey, demo, render, file } before loading this. */
(function () {
  var C = window.CALC, Core = C.core;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function read() { var o = {}; C.fields.forEach(function (k) { o[k] = $(k).value; }); return o; }
  function save() { try { localStorage.setItem(C.storageKey, JSON.stringify(read())); } catch (e) { /* private mode */ } }
  function restore() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(C.storageKey) || "null"); } catch (e) { d = null; }
    if (d) C.fields.forEach(function (k) { if (d[k] != null) $(k).value = d[k]; });
  }
  function hint(t) { $("hint").textContent = t || ""; }
  function line(label, value, cls) { return '<div class="kv"><span>' + esc(label) + '</span><b class="' + (cls || "") + '">' + esc(value) + "</b></div>"; }
  var tracked = false;
  function render() {
    var res = Core.calculate(read()), box = $("result");
    if (res.error) { box.innerHTML = '<p class="notice">' + esc(res.error.join("; ")) + "</p>"; return res; }
    var m = function (n) { return Core.money(n, res.currency); };
    var parts = C.render(res, m);
    box.innerHTML = '<div class="headline"><span class="big">' + esc(parts.big) + '</span><span class="muted">' + esc(parts.sub) + "</span></div>" +
      '<div class="kvgrid">' + parts.rows.map(function (r) { return line(r[0], r[1], r[2]); }).join("") + "</div>" +
      '<ul class="notes">' + res.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>";
    if (!tracked && window.Site) { window.Site.track("calc_result", { tool: C.storageKey }); tracked = true; }
    return res;
  }
  document.addEventListener("DOMContentLoaded", function () {
    restore();
    C.fields.forEach(function (k) { $(k).addEventListener("input", function () { render(); save(); }); $(k).addEventListener("change", function () { render(); save(); }); });
    $("btn-demo").addEventListener("click", function () {
      C.fields.forEach(function (k) { if (C.demo[k] != null) $(k).value = C.demo[k]; });
      render(); save(); hint("Example numbers filled in. Replace them with your own.");
    });
    $("btn-clear").addEventListener("click", function () {
      C.fields.forEach(function (k) { if ($(k).tagName !== "SELECT") $(k).value = ""; });
      $("out").style.display = "none"; hint(""); render(); save();
    });
    $("btn-gen").addEventListener("click", function () {
      var res = Core.calculate(read());
      if (res.error) { hint(res.error.join("; ")); return; }
      $("out").textContent = Core.toMarkdown(res, $("label").value.trim());
      $("out").style.display = "block"; hint("Summary generated.");
    });
    $("btn-copy").addEventListener("click", function () {
      var t = $("out").textContent;
      if (!t) { hint("Click \"Generate summary\" first."); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { hint("Copied."); }, function () { hint("Copy failed, select the text manually."); });
      else hint("Copy is not supported here, select the text manually.");
    });
    render();
  });
})();
