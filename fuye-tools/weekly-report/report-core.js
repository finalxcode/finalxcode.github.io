/* 副业周报生成器 —— 核心逻辑（无 DOM，可在浏览器与 Node 中运行）
 *
 * 设计原则：只做算术和事实描述，不做收益预测、不编「预计可赚多少」。
 * 所有结论都来自用户自己填的数字，输出里不出现任何承诺性表述。
 */
(function (root) {
  var MIN_PER_HOUR = 60;

  function num(v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[^\d.\-]/g, ""));
    return isFinite(n) ? n : 0;
  }

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  // 清洗输入行；空行（无标签且无数字）丢弃
  function normalize(rows) {
    var out = [];
    (rows || []).forEach(function (r) {
      var tag = String(r.tag == null ? "" : r.tag).trim();
      var minutes = num(r.minutes), spend = num(r.spend), income = num(r.income);
      if (!tag && !minutes && !spend && !income) return;
      out.push({
        date: String(r.date || "").trim(),
        tag: tag || "未标注",
        minutes: Math.max(0, minutes),
        spend: Math.max(0, spend),
        income: Math.max(0, income)
      });
    });
    return out;
  }

  function totals(rows) {
    var t = { minutes: 0, spend: 0, income: 0, net: 0, rows: 0, tags: 0, activeDays: 0 };
    var seenTag = {}, seenDay = {};
    (rows || []).forEach(function (r) {
      t.minutes += r.minutes; t.spend += r.spend; t.income += r.income; t.rows++;
      seenTag[r.tag] = 1;
      if (r.minutes || r.spend || r.income) { if (r.date) seenDay[r.date] = 1; }
    });
    t.spend = round2(t.spend);
    t.income = round2(t.income);
    t.net = round2(t.income - t.spend);
    t.tags = Object.keys(seenTag).length;
    t.activeDays = Object.keys(seenDay).length;
    t.hours = round2(t.minutes / MIN_PER_HOUR);
    t.hourly = t.minutes > 0 ? round2(t.income / (t.minutes / MIN_PER_HOUR)) : 0;
    return t;
  }

  function byTag(rows) {
    var map = {}, order = [];
    (rows || []).forEach(function (r) {
      if (!map[r.tag]) { map[r.tag] = { tag: r.tag, count: 0, minutes: 0, spend: 0, income: 0 }; order.push(r.tag); }
      var g = map[r.tag];
      g.count++; g.minutes += r.minutes; g.spend += r.spend; g.income += r.income;
    });
    return order.map(function (k) {
      var g = map[k];
      g.spend = round2(g.spend); g.income = round2(g.income);
      g.net = round2(g.income - g.spend);
      g.hours = round2(g.minutes / MIN_PER_HOUR);
      return g;
    }).sort(function (a, b) { return b.minutes - a.minutes || b.net - a.net; });
  }

  // 事实型结论：只看数字，不预测未来
  function insights(rows, t, tags) {
    var out = [];
    if (!t.rows) return ["这周还没有填任何记录。先记一天，哪怕收入是 0。"];

    if (t.income === 0) {
      out.push("本周现金收入为 0，投入 " + t.hours + " 小时。这不等于失败，但要在下面写清「换来了什么」：跑通一次流程、产出一篇内容、还只是刷了聊天框。");
    } else if (t.net < 0) {
      out.push("收入 " + money(t.income) + " 但支出 " + money(t.spend) + "，净额 " + money(t.net) + "。现金仍在净流出，别把毛收入当利润。");
    } else {
      out.push("本周净额 " + money(t.net) + "，投入 " + t.hours + " 小时，折合时薪约 ¥" + t.hourly + "/小时（按收入算，未扣平台手续费）。");
    }

    if (tags.length >= 2) {
      var top = tags[0];
      var share = t.minutes > 0 ? Math.round(top.minutes / t.minutes * 100) : 0;
      out.push("时间最集中的实验是「" + top.tag + "」，占 " + share + "%（" + top.hours + " 小时）。如果它这周没有产出，下周要考虑砍掉或换做法。");
    }

    if (t.hours >= 10 && t.income === 0) {
      out.push("投入已超过 10 小时且没有现金收入，建议现在就写清弃坑线：达到什么条件就停。");
    }

    var withIncome = tags.filter(function (g) { return g.income > 0; });
    if (withIncome.length > 1) {
      out.push("本周有 " + withIncome.length + " 个实验产生了收入，注意别把不同实验的钱混在一个数里，否则复盘时说不清哪件事值得加码。");
    }

    if (t.activeDays >= 1 && t.activeDays < 7) {
      out.push("有记录的天数 " + t.activeDays + " 天。记录断档比收入低更麻烦——断掉的那几天往往就是决定放弃的转折点。");
    }
    return out;
  }

  function money(n) { return (n < 0 ? "-¥" : "¥") + Math.abs(n).toFixed(2); }

  function toMarkdown(rows, notes) {
    var t = totals(rows), tags = byTag(rows);
    var dates = (rows || []).map(function (r) { return r.date; }).filter(Boolean).sort();
    var range = dates.length ? dates[0] + " ~ " + dates[dates.length - 1] : "（未填日期）";
    var L = [];
    L.push("# 副业实验周报 · " + range);
    L.push("");
    L.push("投入 **" + t.hours + " 小时** · 现金支出 **" + money(t.spend) + "** · 现金收入 **" + money(t.income) + "** · 净额 **" + money(t.net) + "**");
    L.push("");
    L.push("| 实验标签 | 次数 | 投入(小时) | 支出 | 收入 | 净额 |");
    L.push("|---|---|---|---|---|---|");
    tags.forEach(function (g) {
      L.push("| " + g.tag + " | " + g.count + " | " + g.hours + " | " + money(g.spend) + " | " + money(g.income) + " | " + money(g.net) + " |");
    });
    L.push("");
    L.push("## 结论（自动生成，只依据你填的数字）");
    L.push("");
    insights(rows, t, tags).forEach(function (s) { L.push("- " + s); });
    if (notes && String(notes).trim()) {
      L.push("");
      L.push("## 本周记录");
      L.push("");
      L.push(String(notes).trim());
    }
    L.push("");
    L.push("> 个案实测，不代表你的结果。收入为实际到账，未到账的意向不计入。");
    return L.join("\n");
  }

  function toCsv(rows) {
    var head = "日期,实验标签,投入分钟,现金支出,现金收入,净额";
    var lines = rows.map(function (r) {
      return [r.date, r.tag, r.minutes, r.spend, r.income, round2(r.income - r.spend)]
        .map(function (v) { return /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v; }).join(",");
    });
    return [head].concat(lines).join("\n");
  }

  var api = { normalize: normalize, totals: totals, byTag: byTag, insights: insights, toMarkdown: toMarkdown, toCsv: toCsv, round2: round2, money: money };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ReportCore = api;
})(this);
