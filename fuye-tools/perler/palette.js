/* 通用 48 色色卡 —— 不是任何品牌的官方色号。
 * 想按某个品牌出图，在页面「用你自己的色卡」里粘贴该品牌色卡即可。
 * 每项：{ code, name, hex }
 */
(function (root) {
  var P = [
    { code: "G01", name: "白", hex: "#FFFFFF" }, { code: "G02", name: "米白", hex: "#F3EBD9" },
    { code: "G03", name: "浅灰", hex: "#C8C8C8" }, { code: "G04", name: "中灰", hex: "#8E8E8E" },
    { code: "G05", name: "深灰", hex: "#4D4D4D" }, { code: "G06", name: "黑", hex: "#1A1A1A" },
    { code: "G07", name: "浅粉", hex: "#F9C9D6" }, { code: "G08", name: "粉", hex: "#F28CB1" },
    { code: "G09", name: "玫红", hex: "#D93B7F" }, { code: "G10", name: "大红", hex: "#D7262E" },
    { code: "G11", name: "深红", hex: "#8E1B24" }, { code: "G12", name: "珊瑚", hex: "#F2785C" },
    { code: "G13", name: "浅橙", hex: "#F9B27C" }, { code: "G14", name: "橙", hex: "#F07F1E" },
    { code: "G15", name: "深橙", hex: "#C8561A" }, { code: "G16", name: "浅黄", hex: "#FBEA9A" },
    { code: "G17", name: "黄", hex: "#F8D21C" }, { code: "G18", name: "金黄", hex: "#E3A60F" },
    { code: "G19", name: "奶油", hex: "#F6E3B4" }, { code: "G20", name: "浅绿", hex: "#BFE3A1" },
    { code: "G21", name: "草绿", hex: "#7DC242" }, { code: "G22", name: "绿", hex: "#2E9E48" },
    { code: "G23", name: "深绿", hex: "#1E5E35" }, { code: "G24", name: "橄榄", hex: "#8A8B3A" },
    { code: "G25", name: "薄荷", hex: "#9EE2CF" }, { code: "G26", name: "青绿", hex: "#2CB5A0" },
    { code: "G27", name: "浅蓝", hex: "#A9D5F2" }, { code: "G28", name: "天蓝", hex: "#4FA8E0" },
    { code: "G29", name: "蓝", hex: "#2463B5" }, { code: "G30", name: "深蓝", hex: "#1B2F6E" },
    { code: "G31", name: "藏青", hex: "#232A45" }, { code: "G32", name: "浅紫", hex: "#CDB6E6" },
    { code: "G33", name: "紫", hex: "#8A5CC2" }, { code: "G34", name: "深紫", hex: "#52307C" },
    { code: "G35", name: "薰衣草", hex: "#A694D6" }, { code: "G36", name: "浅肤", hex: "#F7D8C2" },
    { code: "G37", name: "肤色", hex: "#EDB894" }, { code: "G38", name: "深肤", hex: "#C98A63" },
    { code: "G39", name: "浅棕", hex: "#C49A6C" }, { code: "G40", name: "棕", hex: "#8B5A2B" },
    { code: "G41", name: "深棕", hex: "#5A3820" }, { code: "G42", name: "咖啡", hex: "#6F4A35" },
    { code: "G43", name: "卡其", hex: "#BFA77A" }, { code: "G44", name: "砖红", hex: "#A8432F" },
    { code: "G45", name: "酒红", hex: "#6E1F33" }, { code: "G46", name: "湖蓝", hex: "#1F8FB5" },
    { code: "G47", name: "灰蓝", hex: "#7D93A8" }, { code: "G48", name: "银灰", hex: "#B3B8BD" }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = P;
  else root.PERLER_PALETTE = P;
})(this);
