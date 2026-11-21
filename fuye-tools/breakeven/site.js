/* 站点信息配置：备案通过后在这里填写 ICP 备案号即可，页脚会自动更新。 */
(function (root) {
  var SITE = {
    name: "副业实验账本",
    homeUrl: "/",            // 部署后改为网站首页地址
    icp: "",                 // 例："晋ICP备20XXXXXXX号-1"（备案通过后填写）
    icpUrl: "https://beian.miit.gov.cn/",
    year: new Date().getFullYear()
  };
  root.SITE = SITE;
  root.SiteFooter = {
    render: function () {
      var el = document.getElementById("site-footer");
      if (!el) return;
      var icp = SITE.icp
        ? '<a href="' + SITE.icpUrl + '" target="_blank" rel="noopener">' + SITE.icp + "</a>"
        : '<span class="muted">本工具在浏览器本地运行，不上传、不保存你的输入</span>';
      el.innerHTML = '<p>© ' + SITE.year + ' <a href="' + SITE.homeUrl + '">' + SITE.name + "</a> · 免费工具，仅供参考</p><p>" + icp + "</p>";
      var brand = document.querySelectorAll("[data-site-name]");
      Array.prototype.forEach.call(brand, function (b) { b.textContent = SITE.name; });
    }
  };
})(this);
