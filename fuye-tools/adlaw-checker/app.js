/* 广告法违禁词检测 —— 页面交互 */
(function () {
  var RULES = window.ADLAW_RULES, Core = window.AdlawCore;
  var $ = function (id) { return document.getElementById(id); };
  var LS_CUSTOM = "fuye_adlaw_custom", LS_CATS = "fuye_adlaw_cats";
  var LEVEL_TEXT = { high: "高风险", medium: "中风险", low: "提示" };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function renderCats() {
    var saved = lsGet(LS_CATS, null);
    $("cats").innerHTML = RULES.categories.map(function (c) {
      var on = !saved || saved.indexOf(c.id) !== -1;
      return '<label class="chip"><input type="checkbox" value="' + c.id + '"' + (on ? " checked" : "") + "> " + esc(c.name) + "</label>";
    }).join("");
  }
  function enabledCats() {
    var ids = [];
    Array.prototype.forEach.call($("cats").querySelectorAll("input"), function (i) { if (i.checked) ids.push(i.value); });
    return ids;
  }
  function customWords() { return $("custom").value.split(/[\n,，、]+/).map(function (s) { return s.trim(); }).filter(Boolean); }

  var lastHits = [];
  function run() {
    var text = $("input").value;
    lsSet(LS_CATS, enabledCats());
    lsSet(LS_CUSTOM, $("custom").value);
    if (!text.trim()) { $("result").hidden = true; return; }
    var hits = Core.scan(text, RULES, { enabledCats: enabledCats().concat(["custom"]), customWords: customWords() });
    lastHits = hits;
    var lc = Core.levelCount(hits);
    var negNote = hits.negatedCount
      ? '<p class="muted neg-note">已忽略 <b>' + hits.negatedCount + '</b> 处否定语境（如「不提供躺赚话术」「不是保收益」「躺赚是不可能的」）。这类是免责表述，通常不算违规。</p>'
      : "";
    $("summary").innerHTML = (hits.length === 0
      ? '<span class="ok">未发现词库中的风险词。</span>仍建议人工复核语境，词库无法覆盖所有情况。'
      : "共命中 <b>" + hits.length + "</b> 处：" +
        '<span class="tag high">高风险 ' + lc.high + "</span>" +
        '<span class="tag medium">中风险 ' + lc.medium + "</span>" +
        '<span class="tag low">提示 ' + lc.low + "</span>") + negNote;

    // 高亮
    var html = "", pos = 0;
    hits.forEach(function (h) {
      html += esc(text.slice(pos, h.start));
      html += '<mark class="' + (h.item.level || "medium") + '" title="' + esc(h.cat.name + "｜" + LEVEL_TEXT[h.item.level || "medium"]) + '">' + esc(h.text) + "</mark>";
      pos = h.end;
    });
    html += esc(text.slice(pos));
    $("highlight").innerHTML = html.replace(/\n/g, "<br>");

    // 分组列表
    $("groups").innerHTML = Core.group(hits).map(function (g) {
      return '<section class="group"><h3>' + esc(g.cat.name) + ' <span class="count">' + g.count + " 处</span></h3>" +
        '<p class="basis">' + esc(g.cat.basis || "") + "</p>" +
        '<p class="reason">' + esc(g.cat.reason || "") + "</p>" +
        '<ul>' + g.words.map(function (w) {
          var lv = w.item.level || "medium";
          return '<li><span class="tag ' + lv + '">' + LEVEL_TEXT[lv] + "</span> <b>" + esc(w.label) + "</b> ×" + w.count +
            (w.samples.length && w.samples[0] !== w.label ? ' <span class="muted">（如：' + esc(w.samples.join("、")) + "）</span>" : "") +
            (w.item.suggest && w.item.suggest.length ? '<div class="suggest">建议：' + esc(w.item.suggest.join(" / ")) + "</div>" : "") +
            (w.item.note ? '<div class="muted">' + esc(w.item.note) + "</div>" : "") + "</li>";
        }).join("") + "</ul></section>";
    }).join("");
    $("result").hidden = false;
  }

  var SAMPLE = "全网最火的副业项目！新手无脑操作，日赚300+，稳赚不赔零风险，100%能出单。\n这是第一步：注册账号。国家级认证导师带你躺赚，包教包会，月入过万不是梦。\n想要资料的加VX，或者私信我。顺便说一句，这款茶还能降血压。";

  document.addEventListener("DOMContentLoaded", function () {
    renderCats();
    $("custom").value = lsGet(LS_CUSTOM, "");
    $("btn-check").addEventListener("click", run);
    $("btn-sample").addEventListener("click", function () { $("input").value = SAMPLE; run(); });
    $("btn-clear").addEventListener("click", function () { $("input").value = ""; $("result").hidden = true; $("input").focus(); });
    $("btn-replace").addEventListener("click", function () {
      if (!lastHits.length) return;
      $("input").value = Core.applySuggestions($("input").value, lastHits);
      run();
    });
    $("btn-copy").addEventListener("click", function () {
      var t = $("input").value;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { $("btn-copy").textContent = "已复制"; setTimeout(function () { $("btn-copy").textContent = "复制文本"; }, 1500); });
    });
    $("cats").addEventListener("change", function () { if ($("input").value.trim()) run(); });
    $("input").addEventListener("input", function () { $("count").textContent = $("input").value.length + " 字"; });
    $("meta").textContent = "词库版本 " + RULES.meta.version + "，整理日期 " + RULES.meta.updated + "。" + RULES.meta.disclaimer;
    if (window.SiteFooter) window.SiteFooter.render();
    if (location.hash === "#demo") { $("input").value = SAMPLE; run(); }
  });
})();
