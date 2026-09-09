/* 沐光共富 · 新手引导（「东高垣数字治理工作站」站）
 * 首访自动弹出一次（localStorage: mg_tour_done_donggaoyuan）；
 * 导航账号区左侧常驻「使用指南」按钮，点击可随时重播。
 * 遮罩点击不关闭，必须点按钮操作，防止误触。
 */
(function () {
  "use strict";
  if (window.__mgtLoaded) return;
  window.__mgtLoaded = true;

  var SITE = "donggaoyuan";
  var KEY = "mg_tour_done_" + SITE;
  var GOLD = "#D4A84B", GOLD2 = "#f0d78c";

  var STEPS = [
    {
      t: "欢迎来到「东高垣数字治理工作站」",
      d: "三件事可以在这里办：查政策（政策智库）、找项目（申报助手）、看数据（数据看板）。数据口径为大荔县全县及东高垣村，来自 2025 年 7—8 月企业台账与公开政策文件。"
    },
    {
      t: "政策智库：像逛超市一样查政策",
      d: "进「政策智库」，先点标签（国家／省／市／县、年份、主题），再输关键词，121 条政策秒级过滤；点进条文可看要点解读与适用对象，不用啃原文。"
    },
    {
      t: "申报助手：4 个条件找出能报的项目",
      d: "进「申报助手」，选好主体类型、项目级别、申报窗口、资金档位，系统从 62 个真实项目里筛出你能报的，给出材料清单与时间节点；选好项目还能一键生成预约登记凭证。"
    },
    {
      t: "数据看板：全县运营一屏掌握",
      d: "「数据看板」汇集装机容量、发电完成率、三级运维状态与客诉闭环，问题电站自动预警标红。县镇干部开会前看一眼，哪些村要督办就心中有数。"
    },
    {
      t: "智能助手与账号",
      d: "左下角金色「问」字按钮可直接提问政策与申报问题；注册登录后进个人中心，提交管理员申请并通过审核后，可维护政策库与项目库，保证数据常新。"
    },
    {
      t: "东高垣实证与背书",
      d: "「东高垣实证」看 185 户签约、5.963 MW 装机的标杆村怎么做成的；「背书与成果」收录政府回函、调研证明等材料，申报项目时可直接引用。"
    },
    {
      t: "预约驻村调研",
      d: "想请项目组到你的乡镇或村庄实地走访？点右上角金色「预约调研」，留下村庄信息与需求，项目组会电话联系安排。"
    }
  ];

  /* ---------- 样式注入（mgt- 前缀） ---------- */
  var css =
    ".mgt-guide{border:1px solid " + GOLD + ";color:" + GOLD2 + ";background:transparent;border-radius:99px;" +
    "padding:6px 14px;font-size:13px;letter-spacing:.04em;cursor:pointer;white-space:nowrap;transition:all .25s;font-family:inherit}" +
    ".mgt-guide:hover{background:" + GOLD + ";color:#1a1405}" +
    ".mgt-mask{position:fixed;inset:0;z-index:10020;background:rgba(8,8,12,.62);backdrop-filter:blur(3px);" +
    "display:flex;align-items:center;justify-content:center;font-family:inherit}" +
    ".mgt-card{width:420px;max-width:92vw;background:rgba(20,22,28,.96);border:1px solid " + GOLD + ";border-radius:18px;" +
    "box-shadow:0 24px 70px rgba(0,0,0,.6);padding:28px 28px 20px;animation:mgt-in .35s ease}" +
    "@keyframes mgt-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}" +
    ".mgt-step-no{font-size:12px;color:" + GOLD2 + ";letter-spacing:.15em;margin-bottom:10px}" +
    ".mgt-title{font-size:20px;font-weight:700;color:#f0ece2;margin:0 0 12px;letter-spacing:.02em}" +
    ".mgt-desc{font-size:14px;line-height:1.85;color:#c9c2b2;margin:0 0 22px;min-height:78px}" +
    ".mgt-foot{display:flex;align-items:center;justify-content:space-between;gap:10px}" +
    ".mgt-dots{display:flex;gap:7px}" +
    ".mgt-dots i{width:8px;height:8px;border-radius:50%;background:rgba(212,168,75,.3);transition:all .25s}" +
    ".mgt-dots i.on{background:" + GOLD2 + ";transform:scale(1.25)}" +
    ".mgt-btns{display:flex;gap:8px;align-items:center}" +
    ".mgt-btn{border-radius:99px;padding:8px 18px;font-size:13.5px;cursor:pointer;transition:all .25s;font-family:inherit}" +
    ".mgt-btn.skip{background:none;border:0;color:#8a8378;padding:8px 10px}" +
    ".mgt-btn.skip:hover{color:#c9c2b2}" +
    ".mgt-btn.prev{background:none;border:1px solid rgba(212,168,75,.5);color:#c9c2b2}" +
    ".mgt-btn.prev:hover{border-color:" + GOLD2 + ";color:" + GOLD2 + "}" +
    ".mgt-btn.next{background:linear-gradient(135deg," + GOLD2 + "," + GOLD + ");border:0;color:#1a1405;font-weight:700}" +
    ".mgt-btn.next:hover{filter:brightness(1.1)}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var mask = null, cur = 0;

  function close(markDone) {
    if (mask) { mask.remove(); mask = null; }
    if (markDone) { try { localStorage.setItem(KEY, "1"); } catch (e) { } }
  }

  function render() {
    var s = STEPS[cur], last = cur === STEPS.length - 1;
    mask.querySelector(".mgt-step-no").textContent = "第 " + (cur + 1) + " 步 · 共 " + STEPS.length + " 步";
    mask.querySelector(".mgt-title").textContent = s.t;
    mask.querySelector(".mgt-desc").textContent = s.d;
    var dots = mask.querySelectorAll(".mgt-dots i");
    dots.forEach(function (d, i) { d.classList.toggle("on", i === cur); });
    mask.querySelector(".mgt-btn.prev").style.visibility = cur === 0 ? "hidden" : "visible";
    mask.querySelector(".mgt-btn.next").textContent = last ? "完成" : "下一步";
  }

  function play() {
    if (mask) return;
    cur = 0;
    mask = document.createElement("div");
    mask.className = "mgt-mask";
    mask.innerHTML =
      '<div class="mgt-card" role="dialog" aria-label="使用指南">' +
      '<div class="mgt-step-no"></div>' +
      '<h3 class="mgt-title"></h3>' +
      '<p class="mgt-desc"></p>' +
      '<div class="mgt-foot">' +
      '<button class="mgt-btn skip">跳过</button>' +
      '<div class="mgt-dots">' + STEPS.map(function () { return "<i></i>"; }).join("") + "</div>" +
      '<div class="mgt-btns">' +
      '<button class="mgt-btn prev">上一步</button>' +
      '<button class="mgt-btn next">下一步</button>' +
      "</div></div></div>";
    document.body.appendChild(mask);
    mask.querySelector(".mgt-btn.skip").addEventListener("click", function () { close(true); });
    mask.querySelector(".mgt-btn.prev").addEventListener("click", function () {
      if (cur > 0) { cur--; render(); }
    });
    mask.querySelector(".mgt-btn.next").addEventListener("click", function () {
      if (cur < STEPS.length - 1) { cur++; render(); } else close(true);
    });
    render();
  }

  /* ---------- 常驻入口：导航账号区左侧「使用指南」 ---------- */
  function mountGuide() {
    var acct = document.getElementById("mgNavAcct");
    if (!acct || document.querySelector(".mgt-guide")) return;
    var b = document.createElement("button");
    b.className = "mgt-guide";
    b.type = "button";
    b.textContent = "使用指南";
    b.addEventListener("click", function (e) { e.preventDefault(); play(); });
    acct.parentNode.insertBefore(b, acct);
  }

  window.MGTour = { play: play };

  mountGuide();
  /* 首访自动弹出（只弹一次） */
  var done = null;
  try { done = localStorage.getItem(KEY); } catch (e) { }
  if (!done) setTimeout(play, 800);
})();
