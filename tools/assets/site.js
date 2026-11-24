/* Site config. Fill these in once the accounts exist; empty values switch the feature off. */
(function (root) {
  var SITE = {
    name: "SideLedger Tools",
    baseUrl: "https://solosaas.top/",
    ga4Id: "",            // Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX"
    adsenseClient: "",    // AdSense publisher ID, e.g. "ca-pub-1234567890123456"
    adsenseSlot: "",      // AdSense ad unit slot ID for the in-content unit
    supportUrl: "",       // Gumroad / Ko-fi / Buy Me a Coffee link
    supportLabel: "Support this free tool",
    productUrl: "",       // Checkout link for the Skills Pack; empty keeps the buy button hidden
    supportEmail: "support@solosaas.top",
    year: new Date().getFullYear()
  };

  function addScript(src, attrs) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
  }

  function initAnalytics() {
    if (!SITE.ga4Id) return;
    addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(SITE.ga4Id));
    root.dataLayer = root.dataLayer || [];
    root.gtag = function () { root.dataLayer.push(arguments); };
    root.gtag("js", new Date());
    root.gtag("config", SITE.ga4Id);
  }

  function track(name, params) {
    if (typeof root.gtag === "function") root.gtag("event", name, params || {});
  }

  function initAds() {
    if (!SITE.adsenseClient) return;
    addScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(SITE.adsenseClient), { crossorigin: "anonymous" });
    if (!SITE.adsenseSlot) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-ad-slot]"), function (el) {
      el.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + SITE.adsenseClient +
        '" data-ad-slot="' + SITE.adsenseSlot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      (root.adsbygoogle = root.adsbygoogle || []).push({});
    });
  }

  function initSupport() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-support]"), function (el) {
      if (!SITE.supportUrl) { el.hidden = true; return; }
      var a = el.querySelector("a.btn");
      if (a) {
        a.href = SITE.supportUrl;
        a.addEventListener("click", function () { track("support_click", { page: location.pathname }); });
      }
      el.hidden = false;
    });
  }

  function initBuy() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-buy]"), function (el) {
      var a = el.querySelector("a.btn");
      if (!SITE.productUrl || !a) { el.hidden = true; return; }
      a.href = SITE.productUrl;
      a.addEventListener("click", function () { track("buy_click", { page: location.pathname }); });
      el.hidden = false;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-buy-closed]"), function (el) { el.hidden = !!SITE.productUrl; });
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var base = document.querySelector("[data-base]");
    var b = base ? base.getAttribute("data-base") : "./";
    el.innerHTML = "<p>© " + SITE.year + ' <a href="' + b + '">' + SITE.name + "</a> · Free tools, everything runs in your browser</p>" +
      '<p><a href="' + b + 'skills-pack/">Skills Pack</a><a href="' + b + 'about/">About</a><a href="' + b + 'terms/">Terms</a><a href="' + b + 'privacy/">Privacy</a><a href="' + b + 'terms/#refunds">Refunds</a><a href="https://github.com/finalxcode/fuye-skills" rel="noopener">GitHub</a></p>' +
      '<p>Support: <a href="mailto:' + SITE.supportEmail + '">' + SITE.supportEmail + "</a></p>";
  }

  root.SITE = SITE;
  root.Site = {
    track: track,
    init: function () { renderFooter(); initSupport(); initBuy(); initAnalytics(); initAds(); }
  };
})(this);
