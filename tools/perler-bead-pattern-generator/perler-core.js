/* Perler / Hama bead pattern generator - core logic (no DOM; runs in browser and Node).
 * Nearest color by CIELAB distance; optional color limit and Floyd-Steinberg dithering; transparent pixels stay empty.
 */
(function (root) {
  function hexToRgb(h) {
    h = String(h == null ? "" : h).trim().replace(/^#/, "");
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(c) { return "#" + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1).toUpperCase(); }
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function rgbToLab(r, g, b) {
    var R = lin(r), G = lin(g), B = lin(b);
    var x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    var y = (R * 0.2126 + G * 0.7152 + B * 0.0722);
    var z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    function f(t) { return t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116); }
    var fx = f(x), fy = f(y), fz = f(z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  function preparePalette(list) {
    var out = [], seen = {};
    (list || []).forEach(function (it) {
      var rgb = hexToRgb(it && it.hex);
      if (!rgb) return;
      var code = String(it.code || ("C" + (out.length + 1))).trim();
      if (!code || seen[code]) return;
      seen[code] = 1;
      out.push({ code: code, name: String(it.name || code).trim(), hex: rgbToHex(rgb), rgb: rgb, lab: rgbToLab(rgb[0], rgb[1], rgb[2]) });
    });
    return out;
  }
  function parsePaletteCSV(text) {
    var palette = [], errors = [];
    String(text || "").split(/\r?\n/).forEach(function (line, i) {
      var s = line.trim();
      if (!s || /^(code|色号)(?=[,\t，\s]|$)/i.test(s)) return;
      var parts = s.split(/[,\t，]/).map(function (x) { return x.trim(); }).filter(function (x) { return x !== ""; });
      var item = parts.length >= 3 ? { code: parts[0], name: parts[1], hex: parts[2] } :
                 parts.length === 2 ? { code: parts[0], name: parts[0], hex: parts[1] } : null;
      if (!item || !hexToRgb(item.hex)) { errors.push(i + 1); return; }
      palette.push(item);
    });
    return { palette: palette, errors: errors };
  }
  function gridSize(iw, ih, tw) {
    iw = Math.max(1, iw); ih = Math.max(1, ih);
    tw = Math.round(tw) || 52;
    var w = Math.max(5, Math.min(200, tw));
    var h = Math.max(1, Math.round(ih / iw * w));
    if (h > 200) { h = 200; w = Math.max(1, Math.round(iw / ih * h)); }
    return { w: w, h: h };
  }
  function nearestIdx(lab, pal, allowed) {
    var best = -1, bd = Infinity;
    for (var i = 0; i < allowed.length; i++) {
      var c = pal[allowed[i]].lab;
      var d0 = lab[0] - c[0], d1 = lab[1] - c[1], d2 = lab[2] - c[2];
      var d = d0 * d0 + d1 * d1 + d2 * d2;
      if (d < bd) { bd = d; best = allowed[i]; }
    }
    return best;
  }
  function c255(v) { v = Math.round(v); return v < 0 ? 0 : (v > 255 ? 255 : v); }
  function spread(buf, w, h, x, y, er, eg, eb, f, empty) {
    if (x < 0 || x >= w || y >= h) return;
    var q = y * w + x;
    if (empty[q]) return;
    buf[q * 3] += er * f; buf[q * 3 + 1] += eg * f; buf[q * 3 + 2] += eb * f;
  }
  function mapPixels(data, w, h, pal, allowed, empty, dither) {
    var n = w * h, grid = new Int16Array(n), cache = {}, buf = null, p;
    if (dither) {
      buf = new Float32Array(n * 3);
      for (p = 0; p < n; p++) { buf[p * 3] = data[p * 4]; buf[p * 3 + 1] = data[p * 4 + 1]; buf[p * 3 + 2] = data[p * 4 + 2]; }
    }
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      p = y * w + x;
      if (empty[p]) { grid[p] = -1; continue; }
      var r, g, b;
      if (dither) { r = c255(buf[p * 3]); g = c255(buf[p * 3 + 1]); b = c255(buf[p * 3 + 2]); }
      else { r = data[p * 4]; g = data[p * 4 + 1]; b = data[p * 4 + 2]; }
      var key = (r << 16) | (g << 8) | b, k = cache[key];
      if (k === undefined) { k = nearestIdx(rgbToLab(r, g, b), pal, allowed); cache[key] = k; }
      grid[p] = k;
      if (dither) {
        var er = r - pal[k].rgb[0], eg = g - pal[k].rgb[1], eb = b - pal[k].rgb[2];
        spread(buf, w, h, x + 1, y, er, eg, eb, 7 / 16, empty);
        spread(buf, w, h, x - 1, y + 1, er, eg, eb, 3 / 16, empty);
        spread(buf, w, h, x, y + 1, er, eg, eb, 5 / 16, empty);
        spread(buf, w, h, x + 1, y + 1, er, eg, eb, 1 / 16, empty);
      }
    }
    return grid;
  }
  function countUse(grid, m) {
    var c = new Array(m); for (var i = 0; i < m; i++) c[i] = 0;
    for (var p = 0; p < grid.length; p++) if (grid[p] >= 0) c[grid[p]]++;
    return c;
  }
  function quantize(data, w, h, pal, opts) {
    opts = opts || {};
    if (!pal || !pal.length) return { error: "The palette is empty" };
    var n = w * h, at = opts.alphaThreshold == null ? 128 : opts.alphaThreshold;
    var wt = opts.whiteThreshold == null ? 245 : opts.whiteThreshold;
    var empty = new Uint8Array(n), p, i, emptyN = 0;
    for (p = 0; p < n; p++) {
      var o = p * 4;
      if (data[o + 3] < at) empty[p] = 1;
      else if (opts.whiteAsEmpty && data[o] >= wt && data[o + 1] >= wt && data[o + 2] >= wt) empty[p] = 1;
      if (empty[p]) emptyN++;
    }
    var all = []; for (i = 0; i < pal.length; i++) all.push(i);
    var grid = mapPixels(data, w, h, pal, all, empty, false);
    var counts = countUse(grid, pal.length), allowed = all;
    var used = []; for (i = 0; i < pal.length; i++) if (counts[i] > 0) used.push(i);
    var mc = opts.maxColors | 0;
    // Dithering must also stay inside the limit, so it only gets the colors the first pass kept.
    if (mc > 0 && (used.length > mc || opts.dither)) {
      used.sort(function (a, b) { return counts[b] - counts[a] || a - b; });
      allowed = used.slice(0, mc);
    }
    if (opts.cleanRare) {
      // Merge colors used by only a few beads (anti-aliasing noise) into the nearest kept color.
      var tot0 = 0; for (i = 0; i < pal.length; i++) tot0 += counts[i];
      var th = Math.max(3, Math.ceil(tot0 * 0.005));
      var kept = allowed.filter(function (k) { return counts[k] >= th; });
      if (kept.length && kept.length < allowed.filter(function (k) { return counts[k] > 0; }).length) allowed = kept;
    }
    if (allowed !== all || opts.dither) {
      grid = mapPixels(data, w, h, pal, allowed, empty, !!opts.dither);
      counts = countUse(grid, pal.length);
    }
    if (opts.cleanRare && !opts.dither) {
      // Single stray bead whose four neighbours share another color becomes that color.
      var g2 = new Int16Array(grid);
      for (var yy = 1; yy < h - 1; yy++) for (var xx = 1; xx < w - 1; xx++) {
        var q0 = yy * w + xx, k0 = grid[q0];
        if (k0 < 0) continue;
        var a = grid[q0 - 1], b2 = grid[q0 + 1], c2 = grid[q0 - w], d2 = grid[q0 + w];
        if (a >= 0 && a !== k0 && a === b2 && a === c2 && a === d2) g2[q0] = a;
      }
      grid = g2; counts = countUse(grid, pal.length);
    }
    var list = [], total = 0;
    for (i = 0; i < pal.length; i++) if (counts[i] > 0) {
      list.push({ index: i, code: pal[i].code, name: pal[i].name, hex: pal[i].hex, count: counts[i] });
      total += counts[i];
    }
    list.sort(function (a, b) { return b.count - a.count || a.index - b.index; });
    return { w: w, h: h, grid: grid, palette: pal, counts: list, total: total, empty: emptyN };
  }
  function boards(w, h, size) {
    if (!size) return { cols: 0, rows: 0, total: 0 };
    var cols = Math.ceil(w / size), rows = Math.ceil(h / size);
    return { cols: cols, rows: rows, total: cols * rows };
  }
  function q(s) {
    s = String(s);
    // A leading = + - @ would run as a formula when the CSV is opened in a spreadsheet.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(res) {
    if (!res || res.error) return "";
    var L = ["Code,Name,Hex,Beads,Buy (+10%)"];
    res.counts.forEach(function (c) { L.push([q(c.code), q(c.name), c.hex, c.count, Math.ceil(c.count * 1.1)].join(",")); });
    L.push(["Total", "", "", res.total, ""].join(","));
    return L.join("\n");
  }
  var api = { hexToRgb: hexToRgb, rgbToLab: rgbToLab, preparePalette: preparePalette, parsePaletteCSV: parsePaletteCSV,
              gridSize: gridSize, nearestIdx: nearestIdx, quantize: quantize, boards: boards, toCSV: toCSV };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PerlerCore = api;
})(this);
