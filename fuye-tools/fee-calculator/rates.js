/*
 * 平台费率配置（可编辑）
 * ------------------------------------------------------------
 * status 含义：
 *   official   —— 已在平台官方页面/公告中核实
 *   news       —— 来自权威媒体对官方公告的转述（官方原文在 App 内或需登录，无法直接打开）
 *   unverified —— 未能核实，默认留空，需要用户按自己后台数据填写；note 中给出“参考区间”及其来源
 * 所有核实日期均为 2026-10-21（北京时间）。费率随时可能调整，请以平台后台最新页面为准。
 */
(function (root) {
  var CHECKED = "2026-10-21";
  var FEE_CONFIG = {
    checked: CHECKED,
    platforms: [
      {
        id: "zsxq",
        name: "知识星球（个人星球）",
        desc: "按订单金额收取平台手续费（年度阶梯）+ 支付通道费。",
        inputs: [
          { key: "price", label: "星球价格（元/人）", def: 199 },
          { key: "qty", label: "成交人数", def: 50 },
          { key: "prior", label: "本统计周期内此前已累计收入（元）", def: 0 },
          { key: "iapShare", label: "其中 iOS App 内购买占比（%）", def: 0 },
          { key: "miniShare", label: "其中 iOS 微信小程序虚拟支付占比（%）", def: 0 }
        ],
        rates: [
          { key: "tier1", label: "平台手续费（年度收入 ≤10万元部分）", value: 20, unit: "%", status: "official",
            source: { title: "知识星球关于「调整个人星球手续费」的通知（2026-08-01 起生效）", url: "https://doc.zsxq.com/personal_expense_adjustments.html", date: CHECKED } },
          { key: "tier2", label: "平台手续费（年度收入 >10万元部分）", value: 10, unit: "%", status: "official",
            source: { title: "知识星球关于「调整个人星球手续费」的通知", url: "https://doc.zsxq.com/personal_expense_adjustments.html", date: CHECKED } },
          { key: "tierLine", label: "阶梯分界线（年度收入）", value: 100000, unit: "元", status: "official",
            source: { title: "知识星球关于「调整个人星球手续费」的通知", url: "https://doc.zsxq.com/personal_expense_adjustments.html", date: CHECKED },
            note: "首个统计周期为 2026-08-01 至 2027-12-31，之后按自然年统计。" },
          { key: "wxpay", label: "微信支付通道费（个人星球）", value: 0.6, unit: "%", status: "official",
            source: { title: "知识星球 | 收费公示", url: "https://www.zsxq.com/fee_publicity.html", date: CHECKED },
            note: "官方说明实际以“微信支付商家助手”显示为准，通常 0.54%～1%。" },
          { key: "iap", label: "苹果内购（IAP）服务费", value: 27, unit: "%", status: "official",
            source: { title: "知识星球 | 收费公示", url: "https://www.zsxq.com/fee_publicity.html", date: CHECKED } },
          { key: "mini", label: "iOS 微信小程序虚拟支付服务费", value: 17, unit: "%", status: "official",
            source: { title: "知识星球 | 收费公示", url: "https://www.zsxq.com/fee_publicity.html", date: CHECKED },
            note: "星球币、星球豆订单不计入阶梯收入，平台手续费仍按 20% 收取。本工具对 iOS 订单按“平台手续费 20% + 通道费”近似计算，计算基数均为订单金额，实际以知识星球结算单为准。" }
        ]
      },
      {
        id: "xianyu",
        name: "闲鱼",
        desc: "软件服务费：基础 0.6%（普通卖家单笔封顶 60 元）；超门槛部分或鱼小铺卖家另收 1%。",
        inputs: [
          { key: "price", label: "单笔成交额（元）", def: 9.9 },
          { key: "qty", label: "本次计算订单数", def: 100 },
          { key: "seller", label: "卖家类型", type: "select", def: "normal", options: [["normal", "普通卖家"], ["yxp", "鱼小铺卖家"]] },
          { key: "priorCount", label: "本自然月此前已成交笔数", def: 0 },
          { key: "priorAmount", label: "本自然月此前已成交金额（元）", def: 0 }
        ],
        rates: [
          { key: "base", label: "基础软件服务费", value: 0.6, unit: "%", status: "news",
            source: { title: "IT之家：闲鱼“鱼小铺”调整优惠规则（转述闲鱼公告，2026-04-18 生效）", url: "https://www.ithome.com/0/940/559.htm", date: CHECKED } },
          { key: "cap", label: "基础服务费单笔封顶（普通卖家）", value: 60, unit: "元", status: "news",
            source: { title: "IT之家（同上，含《闲鱼卖方软件服务费优惠政策说明》变更对照）", url: "https://www.ithome.com/0/940/559.htm", date: CHECKED },
            note: "鱼小铺卖家不享受 60 元封顶。" },
          { key: "extra", label: "软件服务费（超门槛部分 / 鱼小铺每笔）", value: 1, unit: "%", status: "news",
            source: { title: "中新网：闲鱼涨佣一个月（2026-05-24）", url: "https://www.chinanews.com.cn/cj/2026/05-24/10627601.shtml", date: CHECKED } },
          { key: "thCount", label: "门槛：同一自然月成交笔数大于", value: 10, unit: "笔", status: "news",
            source: { title: "中新网（同上）", url: "https://www.chinanews.com.cn/cj/2026/05-24/10627601.shtml", date: CHECKED } },
          { key: "thAmount", label: "门槛：同一自然月累计成交额大于", value: 10000, unit: "元", status: "news",
            source: { title: "中新网（同上）", url: "https://www.chinanews.com.cn/cj/2026/05-24/10627601.shtml", date: CHECKED },
            note: "官方原文在闲鱼 App「我的-设置-闲鱼公约-最新公告」。门槛判定按“此前累计已超过两项门槛后的订单加收 1%”近似计算；另有手机品类专项费未计入。" }
        ]
      },
      {
        id: "xhs",
        name: "小红书店铺",
        desc: "基础技术服务费按商品类目收取 + 支付渠道费。费率因类目而异，请按你店铺后台显示填写。",
        inputs: [
          { key: "price", label: "商品实付价（元）", def: 19.9 },
          { key: "qty", label: "订单数", def: 100 }
        ],
        rates: [
          { key: "tech", label: "基础技术服务费率（按你的类目填写）", value: null, unit: "%", status: "unverified",
            source: { title: "参考：一人公司实战派对小红书电商学习中心费率标准的整理（二手来源）", url: "https://yirengongsi.co/shizhan/xiaohongshu-dianpu-jishufuwufei-dingjia/", date: CHECKED },
            note: "未能直接打开官方费率页核实。二手来源称部分一级类目示例为 2%～5%（如 3C 数码配件 2%、女装 5%）。请到店铺后台或小红书电商学习中心查看你所在类目的费率。" },
          { key: "pay", label: "支付渠道费", value: null, unit: "%", status: "unverified",
            source: { title: "参考：同上（二手来源）", url: "https://yirengongsi.co/shizhan/xiaohongshu-dianpu-jishufuwufei-dingjia/", date: CHECKED },
            note: "二手来源称店铺经营页面列示为 0.7%，未能在官方页面直接核实，请按后台填写。注：未查到“蕴信”相关产品与费率，本项按小红书店铺处理。" }
        ]
      },
      {
        id: "douyin",
        name: "抖音小店",
        desc: "技术服务费 = 结算基数 × 类目费率；如走达人带货另有达人佣金。费率因类目而异，请按抖店后台填写。",
        inputs: [
          { key: "price", label: "商品实付价（元）", def: 19.9 },
          { key: "qty", label: "订单数", def: 100 }
        ],
        rates: [
          { key: "tech", label: "技术服务费率（按你的类目填写）", value: null, unit: "%", status: "unverified",
            source: { title: "参考：一人公司实战派对抖音电商《2026基础技术服务费费率标准》的整理（二手来源）", url: "https://yirengongsi.co/shizhan/douyin-xiaodian-dingjia-jishufuwufei/", date: CHECKED },
            note: "未能直接打开抖音电商规则中心核实。二手来源称类目示例从 1%（食用油）到 5%（服装）不等。请以商品发布页或抖店后台显示为准。" },
          { key: "creator", label: "达人佣金（自卖填 0）", value: 0, unit: "%", status: "unverified",
            source: { title: "由商家在推广设置中自行设定", url: "", date: CHECKED },
            note: "由你和达人约定，不是平台费率。" }
        ]
      },
      {
        id: "mpad",
        name: "公众号流量主",
        desc: "流量主收入 = 广告流水 × 分成比例。广告流水请按你后台的数据估算；如果你填写的已经是后台显示的“收入”，请把分成比例改为 100%。",
        inputs: [
          { key: "reads", label: "文章阅读量", def: 10000 },
          { key: "rpm", label: "每千次阅读广告流水（元，按你的后台数据估算）", def: null }
        ],
        rates: [
          { key: "share", label: "原创文章广告收入分成比例（作者所得）", value: 70, unit: "%", status: "official",
            source: { title: "微信广告：流量主分成政策调整（2019-06-01 起，原创文章 70%）", url: "https://mp.weixin.qq.com/s/-lKACMbhYXhihxVxqFJLBA", date: CHECKED },
            note: "官方公告发布于 2019 年，后续可能调整；非原创文章分成未查到，请按后台填写。开通门槛：关注用户达 100 人（ad.weixin.qq.com/docs/45）。" }
        ]
      },
      {
        id: "reward",
        name: "公众号赞赏（喜欢作者）",
        desc: "读者赞赏结算到作者微信零钱，结算周期 T+7。",
        inputs: [
          { key: "amount", label: "赞赏总额（元）", def: 500 }
        ],
        rates: [
          { key: "fee", label: "赞赏手续费", value: 0, unit: "%", status: "news",
            source: { title: "中华网转载微信官方答疑（2018-06）：公众平台和 iOS 都不收取手续费", url: "https://m.economy.china.com/tech/13001906/20180607/32494494.html", date: CHECKED },
            note: "结算周期 T+7 见微信开放社区《公众号赞赏功能指引》：https://developers.weixin.qq.com/community/develop/doc/00082499f18bc89e317af97f75ec09 。免手续费说明为 2018 年信息，请以“赞赏账户”小程序为准。" }
        ]
      },
      {
        id: "wxpay",
        name: "微信支付商户（个体户/企业）",
        desc: "开通微信支付商户后自己收款，按经营类目收取 0.6%～1% 服务费。",
        inputs: [
          { key: "price", label: "单价（元）", def: 99 },
          { key: "qty", label: "订单数", def: 20 }
        ],
        rates: [
          { key: "fee", label: "交易服务费率", value: 0.6, unit: "%", status: "official",
            source: { title: "微信支付商户平台：接入指引（申请免费；费率 0.6%～1%，与经营类目有关）", url: "https://pay.weixin.qq.com/static/applyment_guide/applyment_detail_store.shtml", date: CHECKED },
            note: "默认按 0.6% 计算，你的类目可能更高，请按商户平台显示修改。" }
        ]
      }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = FEE_CONFIG;
  else root.FEE_CONFIG = FEE_CONFIG;
})(this);
