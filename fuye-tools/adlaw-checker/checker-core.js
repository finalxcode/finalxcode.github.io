/* 广告法违禁词检测 —— 核心匹配逻辑（无 DOM 依赖，可在浏览器与 Node 中运行） */
(function (root) {
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // ---- 否定语境识别 ----
  // 广告文案里「不提供躺赚话术」「不是保收益」「躺赚是不可能的」属于合规免责表述，
  // 若照词面直接标红，用户第一次用就会觉得这工具是噪音。
  // 实测：在「副业实验账本」自有 73 篇文章上，不加这层则 42 处高危命中 100% 是误报。
  var CLAUSE_BREAK = /[。；！？，\n\r]/;          // 分句边界（不含顿号：并列项要留在同一分句里）
  var NEG_BEFORE = /(?:不|无|没|非|未|别|勿|莫|否|免|避免|禁止|杜绝|拒绝|切勿|严禁|忌)/;
  var NEG_AFTER = /^[，、\s]{0,2}(?:是|都|也|并)?(?:不|没)(?:可能|现实|存在|成立|可行|靠谱)/;

  // 命中是否落在链接里。URL 中的数字串会被误判成手机号，域名/路径里的英文也会撞上英文词。
  function inUrl(text, start) {
    var seg = text.slice(Math.max(0, start - 140), start);
    var token = seg.split(/[\s，。；、（）【】「」《》"']/).pop() || "";
    return /https?:\/\//i.test(token) ||
           /^[\w.-]*@/.test(token) ||
           /^[\w.-]+\.(com|cn|net|org|io|top|co|me)\//i.test(token);
  }

  // 命中词是否处在否定语境里
  function inNegation(text, start, end) {
    // 向前：同一分句内出现否定词
    var lo = Math.max(0, start - 40), segStart = lo, i = start - 1;
    for (; i >= lo; i--) {
      if (CLAUSE_BREAK.test(text.charAt(i))) { segStart = i + 1; break; }
    }
    if (NEG_BEFORE.test(text.slice(segStart, start))) return true;
    // 向后：命中词后面紧跟否定结论
    var after = text.slice(end, end + 12);
    return NEG_AFTER.test(after) || /(不存在|不可能|不现实|不成立|不可行)/.test(after);
  }

  // 将词库编译为匹配器列表
  function compile(rules, enabledCats, customWords) {
    var list = [];
    rules.categories.forEach(function (cat) {
      if (enabledCats && enabledCats.indexOf(cat.id) === -1) return;
      cat.items.forEach(function (it) {
        var src = it.pattern ? it.pattern : escapeRegExp(it.word);
        var re;
        try { re = new RegExp(src, "gi"); } catch (e) { return; }
        list.push({
          re: re,
          label: it.label || it.word,
          item: it,
          cat: cat,
          except: it.exceptAfter ? new RegExp(it.exceptAfter) : null
        });
      });
    });
    (customWords || []).forEach(function (w) {
      w = (w || "").trim();
      if (!w) return;
      list.push({
        re: new RegExp(escapeRegExp(w), "gi"),
        label: w,
        item: { word: w, level: "medium", suggest: [] },
        cat: { id: "custom", name: "自定义词", basis: "用户自定义词条", reason: "你添加的自定义风险词。" },
        except: null
      });
    });
    return list;
  }

  // 扫描文本，返回不重叠的命中列表（长词优先）
  function scan(text, rules, opts) {
    opts = opts || {};
    var matchers = compile(rules, opts.enabledCats, opts.customWords);
    var raw = [], negatedCount = 0, urlSkipped = 0;
    matchers.forEach(function (m) {
      m.re.lastIndex = 0;
      var r;
      while ((r = m.re.exec(text)) !== null) {
        if (r[0].length === 0) { m.re.lastIndex++; continue; }
        var end = r.index + r[0].length;
        if (m.except && m.except.test(text.slice(end, end + 8))) continue;
        raw.push({ start: r.index, end: end, text: r[0], label: m.label, item: m.item, cat: m.cat });
      }
    });
    raw.sort(function (a, b) { return a.start - b.start || (b.end - b.start) - (a.end - a.start); });
    var hits = [], lastEnd = -1;
    raw.forEach(function (h) {
      if (h.start >= lastEnd) { hits.push(h); lastEnd = h.end; }
    });

    // 第二遍：否定语境过滤。
    // 关键：判断前先把已命中的词用占位符遮住，否则「稳赚不赔」里的“不”会把后面的「零风险」误放过。
    if (!opts.countNegation && hits.length) {
      var parts = [], pos = 0, i;
      for (i = 0; i < hits.length; i++) {
        parts.push(text.slice(pos, hits[i].start));
        parts.push(new Array(hits[i].end - hits[i].start + 1).join("◇"));
        pos = hits[i].end;
      }
      parts.push(text.slice(pos));
      var masked = parts.join("");
      hits = hits.filter(function (h) {
        if (inUrl(masked, h.start)) { urlSkipped++; return false; }
        if (inNegation(masked, h.start, h.end)) { negatedCount++; return false; }
        return true;
      });
    }
    hits.negatedCount = negatedCount;   // 供页面提示「已忽略 N 处否定语境」
    hits.urlSkipped = urlSkipped;       // 链接内命中数
    return hits;
  }

  // 按分类汇总
  function group(hits) {
    var map = {}, order = [];
    hits.forEach(function (h) {
      var id = h.cat.id;
      if (!map[id]) { map[id] = { cat: h.cat, words: {}, count: 0 }; order.push(id); }
      var g = map[id];
      g.count++;
      var key = h.label;
      if (!g.words[key]) g.words[key] = { label: key, item: h.item, count: 0, samples: [] };
      g.words[key].count++;
      if (g.words[key].samples.length < 3 && g.words[key].samples.indexOf(h.text) === -1) g.words[key].samples.push(h.text);
    });
    return order.map(function (id) {
      var g = map[id];
      return { cat: g.cat, count: g.count, words: Object.keys(g.words).map(function (k) { return g.words[k]; }) };
    });
  }

  function levelCount(hits) {
    var c = { high: 0, medium: 0, low: 0 };
    hits.forEach(function (h) { c[h.item.level || "medium"]++; });
    return c;
  }

  // 用每个命中的第一条建议替换（建议中带括号说明的不替换）
  function applySuggestions(text, hits) {
    var out = "", pos = 0;
    hits.forEach(function (h) {
      out += text.slice(pos, h.start);
      var s = (h.item.suggest || [])[0];
      if (s && !/[（(]/.test(s) && s !== "删除") out += s;
      else if (s === "删除") out += "";
      else out += h.text;
      pos = h.end;
    });
    return out + text.slice(pos);
  }

  var api = { scan: scan, group: group, levelCount: levelCount, applySuggestions: applySuggestions, compile: compile, inNegation: inNegation, inUrl: inUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AdlawCore = api;
})(this);
