/* 沐光共富 · 东高垣数字治理工作站 v3.2 —— 全局交互脚本 */
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
    '<a class="brand" href="index.html"><img src="assets/img/logo.png" alt="沐光共富标识">' +
    '<span class="bt"><b>沐光共富</b><em>数字治理工作站</em></span></a>' +
    '<button class="nav-toggle" aria-label="展开导航">菜单</button>' +
    '<nav class="nav-links">' + links + "</nav>" +
    '<div class="nav-right">' +
    '<a class="rel" href="https://lx-marx.github.io/gongfulu/">相关方案</a>' +
    '<a class="btn btn-gold btn-sm" href="booking.html"' + (cur === "booking.html" ? ' style="box-shadow:0 0 0 2px rgba(240,215,140,.6),0 8px 28px rgba(212,168,75,.32)"' : "") + ">预约调研</a>" +
    '<div id="mgNavAcct"><a class="mga-login" href="account.html">登录 / 注册</a></div>' +
    "</div></div>";
  document.body.prepend(nav);
  var tog = nav.querySelector(".nav-toggle");
  tog.addEventListener("click", function () { nav.querySelector(".nav-links").classList.toggle("open"); });

  var footer = document.createElement("footer");
  footer.className = "footer noise";
  footer.innerHTML =
    '<div class="container"><div class="cols">' +
    '<div><div class="brandline"><img src="assets/img/logo.png" alt="沐光共富标识"><b>沐光共富 Solar Common</b></div>' +
    "<p>屋顶上的共富路——整村光伏建设全周期操作方案与数智治理研究</p>" +
    "<p>出品方：屋顶上的共富路项目组丨首个标杆案例：陕西省渭南市大荔县段家镇东高垣村</p></div>" +
    '<div><h5>核心功能</h5><a href="policy.html">政策智库</a><a href="apply.html">申报助手</a><a href="dashboard.html">数据看板</a></div>' +
    '<div><h5>实证与信任</h5><a href="cases.html">东高垣实证</a><a href="trust.html">背书与成果</a><a href="booking.html">预约调研</a></div>' +
    '<div><h5>相关方案</h5><a href="https://lx-marx.github.io/gongfulu/">屋顶上的共富路——整村光伏建设方案</a></div>' +
    "</div>" +
    '<div class="bottom"><span>© 2026 沐光共富 Solar Common丨屋顶上的共富路项目组</span><span>数据口径：大荔县全县（含东高垣村），截至 2025 年 7—8 月企业台账</span></div>' +
    "</div>";
  document.body.appendChild(footer);

  /* —— 鼠标聚光灯 —— */
  var sp = document.createElement("div");
  sp.id = "spotlight";
  document.body.appendChild(sp);
  document.addEventListener("mousemove", function (e) {
    sp.style.setProperty("--sx", e.clientX + "px");
    sp.style.setProperty("--sy", e.clientY + "px");
  }, { passive: true });

  /* ---------- 液态金属按钮高光 ---------- */
  document.addEventListener("mousemove", function (e) {
    var b = e.target.closest ? e.target.closest(".btn") : null;
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
    b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
  }, { passive: true });

  /* ---------- 页面切换淡出 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/^(#|mailto:|tel:|javascript:)/.test(href) || a.target === "_blank" || /^(https?:)?\/\//.test(href)) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(function () { location.href = href; }, 280);
  });

  /* ---------- 模块入场 ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  /* 动态注入的 .rv 元素也要纳入观察，否则永远透明不可见 */
  function watchRv(root) {
    if (root.nodeType !== 1) return;
    if (root.classList && root.classList.contains("rv")) io.observe(root);
    root.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  }
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  new MutationObserver(function (muts) {
    muts.forEach(function (m) { m.addedNodes.forEach(watchRv); });
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- 数字滚动 1.8s ease-out-expo ---------- */
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    var suffix = el.getAttribute("data-suffix") || "";
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 1800, 1);
      el.textContent = (target * easeOutExpo(p)).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  /* dashboard 动态渲染的 KPI 卡走自己的观察器，但也要用这套滚动，挂全局 */
  window.countUp = countUp;
  var io2 = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); } });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach(function (el) { io2.observe(el); });

  /* ---------- 3D Tilt 磁吸卡 ---------- */
  document.querySelectorAll("[data-tilt]").forEach(function (el) {
    el.style.transformStyle = "preserve-3d";
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -16;
      var ry = ((e.clientX - r.left) / r.width - 0.5) * 16;
      el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  });

  /* ---------- 账号区样式（mga- 前缀） ---------- */
  function mgNavStyle() {
    var st = document.createElement("style");
    st.textContent =
      "#mgNavAcct{display:flex;align-items:center;gap:10px;margin-left:14px;white-space:nowrap}" +
      ".mga-login{display:inline-block;padding:7px 18px;border:1px solid var(--gold);color:var(--gold);" +
      "border-radius:99px;font-size:14px;letter-spacing:.04em;text-decoration:none;transition:all .25s}" +
      ".mga-login:hover{background:var(--gold);color:#1a1405}" +
      ".mga-user{position:relative}" +
      ".mga-name{background:none;border:1px solid rgba(212,168,75,.55);color:var(--gold);border-radius:99px;" +
      "padding:7px 16px;font-size:14px;cursor:pointer;font-family:inherit;transition:all .25s}" +
      ".mga-name:hover{background:rgba(212,168,75,.15)}" +
      ".mga-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:150px;background:rgba(22,24,30,.97);" +
      "border:1px solid var(--gold);border-radius:12px;padding:6px;display:none;flex-direction:column;" +
      "box-shadow:0 12px 32px rgba(0,0,0,.5);z-index:1200}" +
      ".mga-menu.open{display:flex}" +
      ".mga-menu [hidden]{display:none!important}" +
      ".mga-menu a,.mga-menu button{display:block;text-align:left;padding:9px 14px;font-size:13.5px;" +
      "color:#e8e4da;text-decoration:none;background:none;border:0;border-radius:8px;cursor:pointer;font-family:inherit}" +
      ".mga-menu a:hover,.mga-menu button:hover{background:rgba(212,168,75,.18);color:var(--gold)}";
    document.head.appendChild(st);
  }

  /* ---------- 动态脚本加载器：缺什么补什么，最后挂 chat.js / tour.js ---------- */
  function mgLoadJs(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () { cb(); };
    // 一个失败不能拖死整条链，warn 一声继续
    s.onerror = function () { console.warn("[工作站] 加载失败，继续后续脚本：" + src); cb(); };
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

  /* ---------- 导航账号区：未登录→登录/注册；已登录→显示名＋下拉 ---------- */
  function mgRenderAccount() {
    var host = document.getElementById("mgNavAcct");
    if (!host || !window.MG || !MG.auth) return;
    var s = MG.auth.session();
    if (!s || !s.user) {
      host.innerHTML = '<a class="mga-login" href="account.html">登录 / 注册</a>';
      return;
    }
    var name = (s.user.user_metadata && s.user.user_metadata.display_name) ||
      String(s.user.email || "").split("@")[0] || "用户";
    host.innerHTML =
      '<div class="mga-user">' +
      '<button type="button" class="mga-name">' + mgEsc(name) + ' ▾</button>' +
      '<div class="mga-menu">' +
      '<a href="account.html">个人中心</a>' +
      '<a href="admin.html" class="mga-admin" hidden>管理台</a>' +
      '<button type="button" class="mga-out">退出登录</button>' +
      "</div></div>";
    var nameBtn = host.querySelector(".mga-name"), menu = host.querySelector(".mga-menu");
    nameBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", function () { menu.classList.remove("open"); });
    MG.auth.profile().then(function (p) {
      if (p && p.role === "admin") {
        var a = host.querySelector(".mga-admin");
        if (a) a.hidden = false;
      }
    });
    host.querySelector(".mga-out").addEventListener("click", function () {
      MG.auth.signOut().then(function () { location.reload(); });
    });
  }

  /* 已引入 config/api/auth 的页面（account/admin 等）直接复用；
     未引入的页面按需串行补齐，再加载 chat.js / tour.js（全站每页生效）。 */
  function mgBootAddons() {
    var base = "assets/js/", chain = [];
    if (!(window.MG && MG.auth)) {
      if (!window.MG_CONFIG) chain.push(base + "config.js");
      if (!(window.MG && MG.book)) chain.push(base + "api.js");
      chain.push(base + "auth.js");
    }
    chain.push(base + "chat.js", base + "tour.js");
    mgLoadChain(chain, mgRenderAccount);
    document.addEventListener("mg-auth-change", mgRenderAccount);
  }

  /* 本脚本在 body 末尾同步执行（导航先行注入），账号区与附加组件待 DOMContentLoaded 后启动 */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { mgNavStyle(); mgBootAddons(); });
  } else {
    mgNavStyle(); mgBootAddons();
  }

  /* ---------- 工具：打印隔离（只输出目标区域） ---------- */
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
    setTimeout(unmarkPrintZone, 60000); // afterprint 未触发时的兜底清理
  };

  /* ---------- 工具：CSV 导出 ---------- */
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

  /* 工具：收藏（localStorage） */
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
