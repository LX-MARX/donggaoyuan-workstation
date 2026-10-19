/*
 * 东高垣数字治理工作站软件 V2.0
 * Copyright (c) 2026 屋顶上的共富路项目组
 * 图例组件：工程图纸的图例栏——首次访问自动弹出一次（localStorage 标记），
 * 顶带「图例」入口可随时重看；点遮罩或「知道了」均可关闭。
 */
(function () {
  "use strict";
  if (window.__mglLoaded) return;
  window.__mglLoaded = true;

  var KEY = "mg_legend_done_donggaoyuan";

  var ITEMS = [
    ["首页轴测图", "整村光伏系统八层解剖：拖拽旋转视角，滚轮缩放"],
    ["悬停部件", "对应注解与引出虚线同步发亮；点击锁定"],
    ["分解视图", "顶带操作行展开或合拢系统层级"],
    ["政策智库", "119 条五级政策：标签筛选＋关键词检索"],
    ["申报助手", "62 项可申报项目：按主体、特征、领域、资金匹配"],
    ["数据看板", "全县运营指标与三级运维状态"],
    ["答疑", "右缘批注签：内置常见问题解答，未命中转在线问答"]
  ];

  var mask = document.createElement("div");
  mask.className = "legend-mask";
  var listHtml = ITEMS.map(function (it) {
    return '<li><span class="sym">' + it[0] + '</span><span>' + it[1] + "</span></li>";
  }).join("");
  mask.innerHTML =
    '<div class="legend-card" role="dialog" aria-label="图例">' +
    '<div class="lg-t">图 例</div>' +
    '<div class="lg-en">LEGEND · HOW TO READ THIS SHEET</div>' +
    '<div class="lg-rule"></div>' +
    "<ul>" + listHtml + "</ul>" +
    '<div class="lg-foot"><button class="lg-ok" type="button">知道了</button></div>' +
    "</div>";
  document.body.appendChild(mask);

  function close() {
    mask.classList.remove("open");
    try { localStorage.setItem(KEY, "1"); } catch (e) { }
  }
  function play() { mask.classList.add("open"); }

  mask.addEventListener("click", function (e) { if (e.target === mask) close(); });
  mask.querySelector(".lg-ok").addEventListener("click", close);

  var entry = document.getElementById("legendEntry");
  if (entry) entry.addEventListener("click", function (e) { e.preventDefault(); play(); });

  window.MGLegend = { play: play };

  var done = null;
  try { done = localStorage.getItem(KEY); } catch (e) { }
  if (!done) setTimeout(play, 900);
})();
