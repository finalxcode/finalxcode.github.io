/*
 * 广告法违禁词 / 风险词词库（可编辑）
 * ------------------------------------------------------------
 * 说明：
 * 1. 依据《中华人民共和国广告法》（2021年修正）公开条文整理，
 *    以及小红书/抖音等平台社区规范中公开提及的常见风险类型（站外导流、虚假营销等）。
 *    平台类词条为“经验整理”，并非平台官方完整清单。
 * 2. 本词库仅供文案自查参考，不构成法律意见；是否违法需结合具体语境与事实判断。
 * 3. 编辑方法：在对应 category 的 items 里增删即可。
 *    - word:     直接匹配的词（英文不区分大小写）
 *    - pattern:  正则表达式字符串（用于“日赚300+”这类带数字的说法），配合 label 显示
 *    - level:    high（高风险）/ medium（中风险）/ low（提示）
 *    - suggest:  建议替换说法（数组，可为空）
 *    - exceptAfter: 正则字符串；若紧跟在该词后面的文字匹配它，则不算命中（减少误报，如“第一步”）
 *    - note:     额外说明（可选）
 * 词库版本与整理日期见 meta。
 */
(function (root) {
  var ADLAW_RULES = {
    meta: {
      version: "1.0.0",
      updated: "2026-10-21",
      lawName: "《中华人民共和国广告法》（2021年4月29日修正）",
      lawUrl: "https://www.samr.gov.cn/",
      disclaimer: "本工具基于《广告法》公开条文与平台公开规范整理的参考词库，仅用于文案自查，不构成法律意见。是否违规需结合语境、事实与最新规定判断；平台规则以各平台官方最新公告为准。"
    },
    categories: [
      {
        id: "superlative",
        name: "极限词 / 最高级用语",
        basis: "《广告法》第九条第（三）项：广告不得使用“国家级”“最高级”“最佳”等用语。",
        reason: "最高级、排名类绝对化表述无法客观证明，属于广告法明确禁止的用语类型。",
        items: [
          { word: "最好", level: "high", suggest: ["很好", "口碑不错"] },
          { word: "最佳", level: "high", suggest: ["较好", "推荐"] },
          { word: "最优", level: "high", suggest: ["较优", "更合适"] },
          { word: "最强", level: "high", suggest: ["实用", "表现突出"] },
          { word: "最高级", level: "high", suggest: ["高规格"] },
          { word: "最先进", level: "high", suggest: ["较新的", "新一代"] },
          { word: "最便宜", level: "high", suggest: ["价格实惠"] },
          { word: "最低价", level: "high", suggest: ["优惠价"] },
          { word: "全网最低", level: "high", suggest: ["价格实惠"] },
          { word: "史上最低", level: "high", suggest: ["近期优惠"] },
          { word: "最受欢迎", level: "high", suggest: ["受欢迎", "很多人在用"] },
          { word: "最赚钱", level: "high", suggest: ["（删除收益描述）"] },
          { word: "最火", level: "medium", suggest: ["热门", "近期关注度高"] },
          { word: "最新技术", level: "medium", suggest: ["新技术"], note: "如确为客观事实且可证明，可保留时间限定，如“截至X年X月”。" },
          { word: "第一", level: "high", suggest: ["领先（需有依据）", "删除排名表述"], exceptAfter: "^(步|天|次|章|节|期|周|个|篇|部分|条|阶段|批|轮|课|讲|眼|时间|印象|反应|手资料|人称|季度|年|刀|原则|版|性|顺位)" },
          { word: "NO.1", level: "high", suggest: ["删除排名表述"] },
          { word: "No1", level: "high", suggest: ["删除排名表述"] },
          { word: "TOP1", level: "high", suggest: ["删除排名表述"] },
          { word: "销量冠军", level: "high", suggest: ["销量不错（需有数据）"] },
          { word: "顶级", level: "high", suggest: ["高品质", "专业级"] },
          { word: "极致", level: "medium", suggest: ["用心", "细致"] },
          { word: "首选", level: "medium", suggest: ["可选", "值得考虑"] },
          { word: "唯一", level: "medium", suggest: ["少见的", "特色"] },
          { word: "独家", level: "medium", suggest: ["原创", "自研"], note: "如确为独家授权且有证明，可保留。" },
          { word: "绝无仅有", level: "high", suggest: ["少见"] },
          { word: "史无前例", level: "high", suggest: ["少见"] },
          { word: "万能", level: "high", suggest: ["多用途"] },
          { word: "王牌", level: "medium", suggest: ["主推"] },
          { word: "遥遥领先", level: "medium", suggest: ["表现不错（需有依据）"] }
        ]
      },
      {
        id: "authority",
        name: "国家级 / 权威背书",
        basis: "《广告法》第九条第（二）项、第（三）项：不得使用或者变相使用国家机关、国家机关工作人员的名义或者形象；不得使用“国家级”等用语。《商标法》第十四条：生产、经营者不得将“驰名商标”字样用于广告宣传。",
        reason: "冒用国家、机关或权威名义会误导消费者，属于明确禁止情形。",
        items: [
          { word: "国家级", level: "high", suggest: ["删除该表述"] },
          { word: "国家认证", level: "high", suggest: ["如实写明具体证书名称与编号"] },
          { word: "国家推荐", level: "high", suggest: ["删除该表述"] },
          { word: "官方推荐", level: "medium", suggest: ["删除或注明具体来源"] },
          { word: "特供", level: "high", suggest: ["删除该表述"] },
          { word: "专供", level: "high", suggest: ["删除该表述"] },
          { word: "驰名商标", level: "high", suggest: ["删除该表述"] },
          { word: "免检", level: "high", suggest: ["删除该表述"] },
          { word: "领导人", level: "high", suggest: ["删除该表述"] }
        ]
      },
      {
        id: "absolute",
        name: "绝对化 / 保证性用语",
        basis: "《广告法》第四条：广告不得含有虚假或者引人误解的内容；第二十八条（虚假广告情形）。",
        reason: "“100%”“零风险”等保证性表述通常无法兑现，容易构成虚假或引人误解的宣传。",
        items: [
          { word: "100%", level: "high", suggest: ["大多数情况下", "删除"] },
          { word: "百分百", level: "high", suggest: ["大多数情况下", "删除"] },
          { word: "百分之百", level: "high", suggest: ["大多数情况下", "删除"] },
          { word: "绝对", level: "medium", suggest: ["通常", "一般来说"] },
          { word: "保证", level: "medium", suggest: ["尽量", "力求"], exceptAfter: "^(金)" },
          { word: "万无一失", level: "high", suggest: ["相对稳妥"] },
          { word: "零风险", level: "high", suggest: ["风险较低（并说明风险）"] },
          { word: "无风险", level: "high", suggest: ["风险较低（并说明风险）"] },
          { word: "永久有效", level: "medium", suggest: ["有效期内", "写明具体期限"] },
          { word: "立竿见影", level: "medium", suggest: ["见效因人而异"] }
        ]
      },
      {
        id: "income",
        name: "收益承诺 / 夸大赚钱",
        basis: "《广告法》第二十五条：招商等有投资回报预期的商品或者服务广告，应当对可能存在的风险以及风险责任承担有合理提示或者警示，不得对未来效果、收益或者与其相关的情况作出保证性承诺，明示或者暗示保本、无风险或者保收益。",
        reason: "副业、项目类内容属于“有回报预期”的宣传，承诺收益或暗示无风险容易违规，也是用户投诉高发点。",
        items: [
          { word: "躺赚", level: "high", suggest: ["需要持续投入时间", "删除"] },
          { word: "躺着赚钱", level: "high", suggest: ["删除"] },
          { word: "稳赚", level: "high", suggest: ["有亏损可能", "删除"] },
          { word: "稳赚不赔", level: "high", suggest: ["删除并补充风险提示"] },
          { word: "只赚不赔", level: "high", suggest: ["删除并补充风险提示"] },
          { word: "包赚", level: "high", suggest: ["删除"] },
          { word: "必赚", level: "high", suggest: ["删除"] },
          { word: "保本", level: "high", suggest: ["可能亏损"] },
          { word: "保收益", level: "high", suggest: ["收益不确定"] },
          { word: "无脑", level: "medium", suggest: ["步骤较简单（仍需学习）"] },
          { word: "傻瓜式", level: "low", suggest: ["步骤清晰"] },
          { word: "一夜暴富", level: "high", suggest: ["删除"] },
          { word: "暴利", level: "high", suggest: ["删除"] },
          { word: "财务自由", level: "medium", suggest: ["删除"] },
          { word: "轻松月入", level: "high", suggest: ["我的实测数据为……（附样本说明）"] },
          { word: "月入过万", level: "high", suggest: ["我的实测数据为……（附样本说明）"] },
          { word: "年入百万", level: "high", suggest: ["删除"] },
          { word: "快速回本", level: "high", suggest: ["回本周期因人而异"] },
          { word: "被动收入", level: "low", suggest: ["需要前期投入的收入"], note: "非违禁词，但易被理解为“不劳而获”，建议说明投入。" },
          { pattern: "(日|月|年|周|单日|单月)(赚|入|收入|收益|进账)\\s*(过|超|近)?\\s*[0-9一二三四五六七八九十百千万wWkK.]+\\s*[+＋]?", label: "日赚/月入+金额", level: "high", suggest: ["我实测X天收入X元（个案，不代表你的结果）"] },
          { pattern: "(赚|收益|收入|利润)\\s*(翻倍|翻番|[0-9]+\\s*倍)", label: "收益翻倍", level: "high", suggest: ["删除"] }
        ]
      },
      {
        id: "education",
        name: "教育培训效果承诺",
        basis: "《广告法》第二十四条：教育、培训广告不得对升学、通过考试、获得学位学历或者合格证书，或者对教育、培训的效果作出明示或者暗示的保证性承诺。",
        reason: "课程、陪跑、训练营类宣传不能承诺学习效果或结果。",
        items: [
          { word: "包过", level: "high", suggest: ["提供系统练习"] },
          { word: "保过", level: "high", suggest: ["提供系统练习"] },
          { word: "包会", level: "high", suggest: ["配有答疑"] },
          { word: "包教包会", level: "high", suggest: ["配有答疑"] },
          { word: "包就业", level: "high", suggest: ["提供就业信息参考"] },
          { word: "保就业", level: "high", suggest: ["提供就业信息参考"] },
          { word: "学完就能赚", level: "high", suggest: ["学完后能掌握的技能是……"] },
          { word: "包出单", level: "high", suggest: ["删除"] },
          { word: "保底", level: "high", suggest: ["删除"] }
        ]
      },
      {
        id: "medical",
        name: "医疗功效 / 疾病治疗",
        basis: "《广告法》第十七条：除医疗、药品、医疗器械广告外，禁止其他任何广告涉及疾病治疗功能，并不得使用医疗用语或者易使推销的商品与药品、医疗器械相混淆的用语。第十八条：保健食品广告不得表示功效、安全性的断言或者保证，不得涉及疾病预防、治疗功能。",
        reason: "非医疗类内容使用治疗、疗效用语属于高风险。",
        items: [
          { word: "治疗", level: "high", suggest: ["删除"] },
          { word: "治愈", level: "high", suggest: ["删除"] },
          { word: "根治", level: "high", suggest: ["删除"] },
          { word: "疗效", level: "high", suggest: ["使用感受"] },
          { word: "药到病除", level: "high", suggest: ["删除"] },
          { word: "特效", level: "medium", suggest: ["删除"], exceptAfter: "^(字|模板|素材|镜头|视频|包)" },
          { word: "消炎", level: "high", suggest: ["删除"] },
          { word: "抗癌", level: "high", suggest: ["删除"] },
          { word: "防癌", level: "high", suggest: ["删除"] },
          { word: "降血压", level: "high", suggest: ["删除"] },
          { word: "降血糖", level: "high", suggest: ["删除"] },
          { word: "降血脂", level: "high", suggest: ["删除"] },
          { word: "增强免疫力", level: "high", suggest: ["删除"] },
          { word: "无副作用", level: "high", suggest: ["删除"] },
          { word: "排毒", level: "medium", suggest: ["删除"] },
          { word: "祛斑", level: "medium", suggest: ["删除（化妆品需备案用语）"] },
          { word: "减肥", level: "medium", suggest: ["体态管理（避免功效承诺）"] },
          { word: "医生推荐", level: "high", suggest: ["删除"] }
        ]
      },
      {
        id: "pressure",
        name: "诱导 / 虚假紧迫感",
        basis: "《广告法》第二十八条（虚假广告）及《规范促销行为暂行规定》等：价格、库存、时限等信息应真实。",
        reason: "若时限、库存、名额不真实，属于虚假或引人误解的宣传；真实的可保留并写明具体规则。",
        items: [
          { word: "仅此一次", level: "low", suggest: ["写明真实活动时间"] },
          { word: "错过再等一年", level: "low", suggest: ["写明真实活动时间"] },
          { word: "最后一天", level: "low", suggest: ["写明截止日期"], note: "若为真实截止日期可保留。" },
          { word: "名额有限", level: "low", suggest: ["本期名额X人"] },
          { word: "手慢无", level: "low", suggest: ["写明真实库存"] },
          { word: "假一赔十", level: "medium", suggest: ["按平台规则售后"] }
        ]
      },
      {
        id: "diversion",
        name: "站外引流词（平台风控）",
        basis: "小红书、抖音等平台社区规范公开禁止“站外导流”（如引导添加微信、QQ、留联系方式）。本类为平台规则经验整理，非《广告法》条款，也非平台官方完整清单。",
        reason: "在小红书、抖音等内容平台发布时，直接或变相留联系方式可能导致限流、删帖或处罚。在你自己的网站上使用一般不受此限制。",
        items: [
          { word: "微信", level: "low", suggest: ["主页有说明", "删除"], note: "如果是在讲解“微信支付”等功能，可忽略。" },
          { word: "VX", level: "medium", suggest: ["删除"] },
          { word: "V信", level: "medium", suggest: ["删除"] },
          { word: "薇信", level: "medium", suggest: ["删除"] },
          { word: "威信", level: "medium", suggest: ["删除"] },
          { word: "加V", level: "medium", suggest: ["删除"] },
          { word: "加微", level: "medium", suggest: ["删除"] },
          { word: "wx", level: "medium", suggest: ["删除"] },
          { word: "扣扣", level: "medium", suggest: ["删除"] },
          { word: "QQ号", level: "medium", suggest: ["删除"] },
          { word: "QQ群", level: "medium", suggest: ["删除"] },
          { word: "私我", level: "low", suggest: ["评论区交流"] },
          { word: "私信我", level: "low", suggest: ["评论区交流"] },
          { word: "滴滴我", level: "low", suggest: ["评论区交流"] },
          { word: "评论区扣1", level: "low", suggest: ["欢迎评论交流"] },
          { word: "手机号", level: "medium", suggest: ["删除"] },
          { word: "二维码", level: "low", suggest: ["删除"] },
          { pattern: "1[3-9]\\d{9}", label: "疑似手机号码", level: "high", suggest: ["删除联系方式"] }
        ]
      },
      {
        id: "platform",
        name: "平台敏感 / 违规营销",
        basis: "依据各平台社区规范中公开禁止的行为类型（虚假营销、作弊、侵权等）整理，属于经验参考。",
        reason: "涉及盗版、作弊、刷量等内容，在平台上容易被处罚，本身也可能违法。",
        items: [
          { word: "破解版", level: "high", suggest: ["正版/官方版"] },
          { word: "永久激活", level: "high", suggest: ["删除"] },
          { word: "白嫖", level: "medium", suggest: ["免费可用（确认来源合法）"] },
          { word: "刷单", level: "high", suggest: ["删除"] },
          { word: "刷粉", level: "high", suggest: ["删除"] },
          { word: "刷量", level: "high", suggest: ["删除"] },
          { word: "代刷", level: "high", suggest: ["删除"] },
          { word: "外挂", level: "high", suggest: ["删除"] },
          { word: "免费领", level: "low", suggest: ["写明领取条件"] },
          { word: "0元购", level: "medium", suggest: ["写明真实规则"] },
          { word: "互粉", level: "low", suggest: ["删除"] },
          { word: "互赞", level: "low", suggest: ["删除"] }
        ]
      }
    ]
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = ADLAW_RULES; }
  else { root.ADLAW_RULES = ADLAW_RULES; }
})(this);
