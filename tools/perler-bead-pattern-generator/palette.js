/* Generic 48-color palette. These are NOT official Perler, Hama or Artkal color codes.
 * To match the beads you own, paste your brand's chart into "Use your own palette" on the page.
 * Each entry: { code, name, hex }
 */
(function (root) {
  var P = [
    { code: "G01", name: "White", hex: "#FFFFFF" }, { code: "G02", name: "Ivory", hex: "#F3EBD9" },
    { code: "G03", name: "Light Gray", hex: "#C8C8C8" }, { code: "G04", name: "Gray", hex: "#8E8E8E" },
    { code: "G05", name: "Dark Gray", hex: "#4D4D4D" }, { code: "G06", name: "Black", hex: "#1A1A1A" },
    { code: "G07", name: "Light Pink", hex: "#F9C9D6" }, { code: "G08", name: "Pink", hex: "#F28CB1" },
    { code: "G09", name: "Magenta", hex: "#D93B7F" }, { code: "G10", name: "Red", hex: "#D7262E" },
    { code: "G11", name: "Dark Red", hex: "#8E1B24" }, { code: "G12", name: "Coral", hex: "#F2785C" },
    { code: "G13", name: "Light Orange", hex: "#F9B27C" }, { code: "G14", name: "Orange", hex: "#F07F1E" },
    { code: "G15", name: "Dark Orange", hex: "#C8561A" }, { code: "G16", name: "Light Yellow", hex: "#FBEA9A" },
    { code: "G17", name: "Yellow", hex: "#F8D21C" }, { code: "G18", name: "Gold", hex: "#E3A60F" },
    { code: "G19", name: "Cream", hex: "#F6E3B4" }, { code: "G20", name: "Light Green", hex: "#BFE3A1" },
    { code: "G21", name: "Grass Green", hex: "#7DC242" }, { code: "G22", name: "Green", hex: "#2E9E48" },
    { code: "G23", name: "Dark Green", hex: "#1E5E35" }, { code: "G24", name: "Olive", hex: "#8A8B3A" },
    { code: "G25", name: "Mint", hex: "#9EE2CF" }, { code: "G26", name: "Teal", hex: "#2CB5A0" },
    { code: "G27", name: "Light Blue", hex: "#A9D5F2" }, { code: "G28", name: "Sky Blue", hex: "#4FA8E0" },
    { code: "G29", name: "Blue", hex: "#2463B5" }, { code: "G30", name: "Dark Blue", hex: "#1B2F6E" },
    { code: "G31", name: "Navy", hex: "#232A45" }, { code: "G32", name: "Light Purple", hex: "#CDB6E6" },
    { code: "G33", name: "Purple", hex: "#8A5CC2" }, { code: "G34", name: "Dark Purple", hex: "#52307C" },
    { code: "G35", name: "Lavender", hex: "#A694D6" }, { code: "G36", name: "Light Peach", hex: "#F7D8C2" },
    { code: "G37", name: "Peach", hex: "#EDB894" }, { code: "G38", name: "Tan", hex: "#C98A63" },
    { code: "G39", name: "Light Brown", hex: "#C49A6C" }, { code: "G40", name: "Brown", hex: "#8B5A2B" },
    { code: "G41", name: "Dark Brown", hex: "#5A3820" }, { code: "G42", name: "Coffee", hex: "#6F4A35" },
    { code: "G43", name: "Khaki", hex: "#BFA77A" }, { code: "G44", name: "Brick", hex: "#A8432F" },
    { code: "G45", name: "Burgundy", hex: "#6E1F33" }, { code: "G46", name: "Turquoise", hex: "#1F8FB5" },
    { code: "G47", name: "Slate Blue", hex: "#7D93A8" }, { code: "G48", name: "Silver", hex: "#B3B8BD" }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = P;
  else root.PERLER_PALETTE = P;
})(this);
