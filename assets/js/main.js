/*
 * 东高垣数字治理工作站软件 V2.0
 * Copyright (c) 2026 屋顶上的共富路项目组
 * 共享脚本：顶带导航与图签页脚注入、模块入场淡入、打印隔离、CSV 导出、收藏。
 */
(function () {
  "use strict";

  /* ---------- 站点结构：导航与页脚统一注入 ---------- */
  var PAGES = [
    ["index.html", "总览"],
    ["policy.html", "政策智库"],
    ["apply.html", "申报助手"],
    ["dashboard.html", "数据看板"],
    ["cases.html", "东高垣实证"],
    ["trust.html", "背书与成果"],
    ["booking.html", "预约调研"]
  ];
  var cur = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  var nav = document.createElement("header");
  nav.className = "nav";
  var links = PAGES.map(function (p) {
    return '<a href="' + p[0] + '"' + (p[0] === cur ? ' class="cur"' : "") + ">" + p[1] + "</a>";
  }).join("");
  nav.innerHTML =
    '<div class="nav-inner">' +
    '<a class="brand" href="index.html"><img src="assets/img/logo.png" alt="东高垣数字治理工作站标识">' +
    '<span class="bt"><b>东高垣</b><em>数字治理工作站</em></span></a>' +
    '<button class="nav-toggle" aria-label="展开导航">菜单</button>' +
    '<nav class="nav-links">' + links + "</nav>" +
    '<div class="nav-right">' +
    '<a class="rel" href="#" id="legendEntry">图例</a>' +
    '<a class="rel" href="#" id="qaEntry">答疑</a>' +
    '<a class="rel" href="https://lx-marx.github.io/gongfulu/">共富路档案</a>' +
    '<a class="btn btn-gold btn-sm" href="booking.html">预约调研</a>' +
    '<div id="mgNavAcct" hidden></div>' +
    "</div></div>";
  document.body.prepend(nav);
  var tog = nav.querySelector(".nav-toggle");
  tog.addEventListener("click", function () { nav.querySelector(".nav-links").classList.toggle("open"); });

  var footer = document.createElement("footer");
  footer.className = "footer noise";
  footer.innerHTML =
    '<div class="container"><div class="cols">' +
    '<div><div class="brandline"><img src="assets/img/logo.png" alt="东高垣数字治理工作站标识"><b>东高垣数字治理工作站</b></div>' +
    "<p>屋顶上的共富路——整村光伏建设全周期操作方案与数智治理研究</p>" +
    "<p>首个标杆案例：陕西省渭南市大荔县段家镇东高垣村</p></div>" +
    '<div><h5>核心功能</h5><a href="policy.html">政策智库</a><a href="apply.html">申报助手</a><a href="dashboard.html">数据看板</a></div>' +
    '<div><h5>实证与信任</h5><a href="cases.html">东高垣实证</a><a href="trust.html">背书与成果</a><a href="booking.html">预约调研</a></div>' +
    '<div><h5>相关方案</h5><a href="https://lx-marx.github.io/gongfulu/">屋顶上的共富路——整村光伏建设方案</a><a href="account.html" style="margin-top:10px;opacity:.7">管理入口</a></div>' +
    "</div>" +
    '<div class="bottom"><span>© 2026 屋顶上的共富路项目组｜东高垣数字治理工作站</span><span>数据口径：大荔县全县（含东高垣村），截至 2025 年 7—8 月企业台账</span></div>' +
    "</div>";
  document.body.appendChild(footer);

  /* ---------- 模块入场淡入 ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  function watchRv(root) {
    if (root.nodeType !== 1) return;
    if (root.classList && root.classList.contains("rv")) io.observe(root);
    root.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  }
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  var rvObserver = new MutationObserver(function (muts) {
    muts.forEach(function (m) { m.addedNodes.forEach(watchRv); });
  });
  document.querySelectorAll("header.nav, section, footer.footer").forEach(function (root) {
    rvObserver.observe(root, { childList: true, subtree: true });
  });

  /* ---------- 数字直显（取消滚动动画，保留 data-count 语义） ---------- */
  function countUp(el) {
    if (!el) return;
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    if (raw == null || !isFinite(target)) return;
    var dec = (raw.split(".")[1] || "").length;
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = target.toFixed(dec) + suffix;
  }
  window.countUp = countUp; /* 看板等页的动态渲染复用同一入口 */
  document.querySelectorAll("[data-count]").forEach(countUp);

  /* ---------- 账号逻辑保留（入口不在导航，仅页脚「管理入口」） ---------- */
  function mgLoadJs(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () { cb(); };
    s.onerror = function () { console.warn("[工作站] 脚本加载失败，继续后续脚本：" + src); cb(); };
    document.body.appendChild(s);
  }
  function mgLoadChain(list, done) {
    var i = 0;
    (function next() {
      if (i >= list.length) { done(); return; }
      mgLoadJs(list[i++], next);
    })();
  }
  function mgEsc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  window.mgEsc = mgEsc;

  /* 未引入 config/api/auth 的页面按需串行补齐，再加载答疑与图例组件。 */
  function mgBootAddons() {
    var base = "assets/js/", chain = [];
    if (!(window.MG && MG.auth)) {
      if (!window.MG_CONFIG) chain.push(base + "config.js");
      if (!(window.MG && MG.book)) chain.push(base + "api.js");
      chain.push(base + "auth.js");
    }
    if (!window.MGFAQ) chain.push(base + "faq.js");
    chain.push(base + "chat.js", base + "legend.js");
    mgLoadChain(chain, function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mgBootAddons);
  } else {
    mgBootAddons();
  }

  /* ---------- 打印隔离 ---------- */
  window.WS = window.WS || {};
  function unmarkPrintZone() {
    document.body.classList.remove("pz-on");
    document.querySelectorAll(".pz-path,.pz-live").forEach(function (n) {
      n.classList.remove("pz-path", "pz-live");
      n.removeAttribute("data-pz-title");
    });
  }
  window.addEventListener("afterprint", unmarkPrintZone);
  window.WS.printZone = function (target, title) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) { window.print(); return; }
    unmarkPrintZone();
    el.classList.add("pz-live");
    if (title) el.setAttribute("data-pz-title", title);
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) p.classList.add("pz-path");
    document.body.classList.add("pz-on");
    window.print();
    setTimeout(unmarkPrintZone, 60000);
  };

  /* ---------- CSV 导出 ---------- */
  window.WS.exportCSV = function (filename, rows) {
    var csv = rows.map(function (r) {
      return r.map(function (c) {
        c = String(c == null ? "" : c);
        return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
      }).join(",");
    }).join("\r\n");
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  };

  /* ---------- 收藏（localStorage） ---------- */
  window.WS.fav = {
    key: "ws_apply_favs",
    all: function () { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return []; } },
    has: function (no) { return this.all().indexOf(no) >= 0; },
    toggle: function (no) {
      var a = this.all(), i = a.indexOf(no);
      if (i >= 0) a.splice(i, 1); else a.push(no);
      localStorage.setItem(this.key, JSON.stringify(a));
      return a.indexOf(no) >= 0;
    }
  };
})();
