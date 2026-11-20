/* 平台到账计算 —— 核心计算逻辑（无 DOM 依赖） */
(function (root) {
  function r2(n) { return Math.round(n * 100) / 100; }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : NaN; }
  function need(rates, keys) {
    var miss = keys.filter(function (k) { return rates[k] === null || rates[k] === undefined || rates[k] === "" || isNaN(num(rates[k])); });
    return miss.length ? miss : null;
  }

  var calcs = {
    zsxq: function (i, r) {
      var miss = need(r, ["tier1", "tier2", "tierLine", "wxpay", "iap", "mini"]); if (miss) return { error: miss };
      var gross = num(i.price) * num(i.qty);
      var iapS = Math.min(Math.max(num(i.iapShare) || 0, 0), 100) / 100;
      var miniS = Math.min(Math.max(num(i.miniShare) || 0, 0), 100 - iapS * 100) / 100;
      var wxAmt = gross * (1 - iapS - miniS), iapAmt = gross * iapS, miniAmt = gross * miniS;
      var prior = Math.max(num(i.prior) || 0, 0), line = num(r.tierLine);
      var inTier1 = Math.max(Math.min(wxAmt, line - prior), 0), inTier2 = wxAmt - inTier1;
      var platWx = inTier1 * num(r.tier1) / 100 + inTier2 * num(r.tier2) / 100;
      var platIos = (iapAmt + miniAmt) * num(r.tier1) / 100;
      var chWx = wxAmt * num(r.wxpay) / 100, chIap = iapAmt * num(r.iap) / 100, chMini = miniAmt * num(r.mini) / 100;
      var lines = [
        { label: "平台手续费（微信支付订单，阶梯计算）", amount: r2(platWx) },
        { label: "平台手续费（iOS 订单，按 " + r.tier1 + "%）", amount: r2(platIos) },
        { label: "微信支付通道费", amount: r2(chWx) },
        { label: "苹果内购服务费", amount: r2(chIap) },
        { label: "iOS 小程序虚拟支付服务费", amount: r2(chMini) }
      ];
      return finish(gross, lines, ["未计算个人所得税等税费；知识星球已说明手续费不含税费。"]);
    },
    xianyu: function (i, r) {
      var miss = need(r, ["base", "cap", "extra", "thCount", "thAmount"]); if (miss) return { error: miss };
      var price = num(i.price), qty = Math.floor(num(i.qty));
      var cnt = Math.max(num(i.priorCount) || 0, 0), amt = Math.max(num(i.priorAmount) || 0, 0);
      var yxp = i.seller === "yxp", baseFee = 0, extraFee = 0, extraOrders = 0;
      for (var k = 0; k < qty; k++) {
        var b = price * num(r.base) / 100;
        if (!yxp) b = Math.min(b, num(r.cap));
        baseFee += b;
        var over = yxp || (cnt >= num(r.thCount) && amt > num(r.thAmount));
        if (over) { extraFee += price * num(r.extra) / 100; extraOrders++; }
        cnt++; amt += price;
      }
      var gross = price * qty;
      return finish(gross, [
        { label: "基础软件服务费" + (yxp ? "（鱼小铺不封顶）" : "（单笔封顶 " + r.cap + " 元）"), amount: r2(baseFee) },
        { label: "软件服务费 " + r.extra + "%（适用 " + extraOrders + " 笔）", amount: r2(extraFee) }
      ], ["门槛判定为近似计算；退款订单已扣服务费不退还（据公告转述）；手机品类专项费未计入。"]);
    },
    xhs: function (i, r) {
      var miss = need(r, ["tech", "pay"]); if (miss) return { error: miss };
      var gross = num(i.price) * num(i.qty);
      return finish(gross, [
        { label: "基础技术服务费", amount: r2(gross * num(r.tech) / 100) },
        { label: "支付渠道费", amount: r2(gross * num(r.pay) / 100) }
      ], ["按“实付金额 × 费率”简化计算，未考虑平台补贴、税金、退货运费等。"]);
    },
    douyin: function (i, r) {
      var miss = need(r, ["tech", "creator"]); if (miss) return { error: miss };
      var gross = num(i.price) * num(i.qty);
      return finish(gross, [
        { label: "技术服务费", amount: r2(gross * num(r.tech) / 100) },
        { label: "达人佣金", amount: r2(gross * num(r.creator) / 100) }
      ], ["按“实付金额 × 费率”简化计算；实际结算基数含平台/主播优惠等，另有运费险、违约扣罚等未计入。"]);
    },
    mpad: function (i, r) {
      var miss = need(r, ["share"]); if (miss) return { error: miss };
      if (isNaN(num(i.rpm))) return { error: ["rpm"], inputError: true };
      var gross = num(i.reads) / 1000 * num(i.rpm);
      var platform = gross * (1 - num(r.share) / 100);
      return finish(gross, [{ label: "平台分成（广告流水 × " + r2(100 - num(r.share)) + "%）", amount: r2(platform) }],
        ["“每千次阅读广告流水”因账号、行业、时段差异很大，本工具不提供默认值，请按自己后台数据估算。计算结果为税前。"], "广告流水（估算）");
    },
    reward: function (i, r) {
      var miss = need(r, ["fee"]); if (miss) return { error: miss };
      var gross = num(i.amount);
      return finish(gross, [{ label: "赞赏手续费", amount: r2(gross * num(r.fee) / 100) }], ["结算周期 T+7，到作者微信零钱。"]);
    },
    wxpay: function (i, r) {
      var miss = need(r, ["fee"]); if (miss) return { error: miss };
      var gross = num(i.price) * num(i.qty);
      return finish(gross, [{ label: "微信支付交易服务费", amount: r2(gross * num(r.fee) / 100) }], ["未计算税费与退款。"]);
    }
  };

  function finish(gross, lines, notes, grossLabel) {
    var fees = lines.reduce(function (s, l) { return s + l.amount; }, 0);
    var net = gross - fees;
    return {
      grossLabel: grossLabel || "成交总额",
      gross: r2(gross), lines: lines, totalFee: r2(fees), net: r2(net),
      feeRatio: gross > 0 ? r2(fees / gross * 100) : 0, notes: notes || []
    };
  }

  function calculate(platformId, inputs, rates) {
    if (!calcs[platformId]) throw new Error("未知平台：" + platformId);
    return calcs[platformId](inputs, rates);
  }

  var api = { calculate: calculate, platforms: Object.keys(calcs) };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FeeCore = api;
})(this);
