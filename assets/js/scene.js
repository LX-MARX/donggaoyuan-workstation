/*
 * 东高垣数字治理工作站软件 V2.0
 * Copyright (c) 2026 屋顶上的共富路项目组
 * 中心件：整村光伏系统轴测爆炸图（Three.js 本地 vendor，importmap 引入）。
 * 八层按电流路径自配电网至组件阵列堆叠；可分解/合拢、轨道旋转、悬停联动注解。
 * 无 WebGL 或 prefers-reduced-motion 时由页面保留静态说明，不报错。
 */
import * as THREE from "../vendor/three.module.js";
import { OrbitControls } from "../vendor/OrbitControls.js";

var IVORY = 0xEFE7D3, AMBER = 0xD9A441, BLUE = 0x24405E, PANEL = 0x16283F;

var PARTS = [
  { id: "08", name: "配电网", w: 300, d: 150, h: 12, spec: "10 kV 台区线路 · 电网企业" },
  { id: "07", name: "台区变压器", w: 200, d: 110, h: 44, spec: "容量瓶颈 · 核算前置 · 电网企业" },
  { id: "06", name: "并网箱", w: 150, d: 90, h: 32, spec: "过压·欠压·孤岛保护 · 企业建设" },
  { id: "05", name: "双向电表", w: 120, d: 80, h: 26, spec: "0.3545 元/度计量 · 电网企业" },
  { id: "04", name: "组串逆变器", w: 170, d: 95, h: 38, spec: "直流变交流 · 光伏企业" },
  { id: "03", name: "直流汇流线束", w: 230, d: 120, h: 14, spec: "光伏专用电缆 · 光伏企业" },
  { id: "02", name: "支架与导轨", w: 330, d: 190, h: 20, spec: "热镀锌钢 · 一字坡/人字坡" },
  { id: "01", name: "光伏组件阵列", w: 380, d: 220, h: 22, spec: "635 W/块 · 户均约 50 块" }
];

export function initScene(opts) {
  var stage = document.getElementById(opts.stageId);
  var canvas = document.getElementById(opts.canvasId);
  var railR = document.getElementById(opts.railId);
  var readout = document.getElementById(opts.readoutId);
  var wires = document.getElementById(opts.wiresId);
  var scope = document.getElementById(opts.scopeId);
  if (!stage || !canvas) return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 1, 6000);
  camera.position.set(620, 520, 620);

  var controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .08;
  controls.minDistance = 380; controls.maxDistance = 1600;
  controls.minPolarAngle = .5; controls.maxPolarAngle = 1.42;
  controls.autoRotate = true; controls.autoRotateSpeed = .7;
  var spinOn = true, idleTimer = null;
  controls.addEventListener("start", function () { controls.autoRotate = false; clearTimeout(idleTimer); });
  controls.addEventListener("end", function () {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { if (spinOn) controls.autoRotate = true; }, 2600);
  });

  scene.add(new THREE.HemisphereLight(0xEAF1F8, 0x0A1420, .85));
  var key = new THREE.DirectionalLight(0xFFF4E0, 1.6);
  key.position.set(500, 800, 300);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -450; key.shadow.camera.right = 450;
  key.shadow.camera.top = 450; key.shadow.camera.bottom = -450;
  key.shadow.bias = -0.0004;
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x9FB8D8, .5);
  rim.position.set(-400, 300, -500);
  scene.add(rim);

  var ground = new THREE.Mesh(new THREE.CircleGeometry(900, 64), new THREE.ShadowMaterial({ opacity: .34 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  var grid = new THREE.GridHelper(1500, 34, 0x3A5373, 0x2A4160);
  grid.material.transparent = true; grid.material.opacity = .5;
  scene.add(grid);
  var ring = new THREE.Mesh(new THREE.RingGeometry(340, 341.5, 96),
    new THREE.MeshBasicMaterial({ color: IVORY, transparent: true, opacity: .35, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .5;
  scene.add(ring);

  var layers = [];
  function edged(geo, color) {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({ color: color, roughness: .62, metalness: .25 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    var eg = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20),
      new THREE.LineBasicMaterial({ color: IVORY, transparent: true, opacity: .8 }));
    g.add(mesh); g.add(eg);
    g.userData.mat = mat; g.userData.edge = eg.material;
    return g;
  }

  function buildPart(pt, idx) {
    var L = new THREE.Group();
    var w = pt.w, d = pt.d, h = pt.h;
    var tint = new THREE.Color(BLUE).offsetHSL(0, 0, idx * .012);
    L.add(edged(new THREE.BoxGeometry(w, h, d), tint.getHex()));

    if (pt.id === "01") {
      for (var px = 0; px < 4; px++) for (var pz = 0; pz < 2; pz++) {
        var pw = w / 4 - 14, pd = d / 2 - 14;
        var pan = edged(new THREE.BoxGeometry(pw, 5, pd), PANEL);
        pan.position.set(-w / 2 + pw / 2 + 7 + px * (pw + 14), h / 2 + 8, -d / 2 + pd / 2 + 7 + pz * (pd + 14));
        L.add(pan);
      }
    }
    if (pt.id === "02") for (var r = -1; r <= 1; r++) {
      var rail = edged(new THREE.BoxGeometry(w, 6, 10), 0x2E4A6B);
      rail.position.set(0, h / 2 + 3, r * (d / 3)); L.add(rail);
    }
    if (pt.id === "03") for (var c = -1; c <= 1; c++) {
      var cable = edged(new THREE.CylinderGeometry(3.4, 3.4, w, 12), 0x3A5373);
      cable.rotation.z = Math.PI / 2; cable.position.set(0, h / 2 + 4, c * 26); L.add(cable);
    }
    if (pt.id === "04") for (var f = -3; f <= 3; f++) {
      var fin = edged(new THREE.BoxGeometry(4, h + 14, d - 16), 0x2E4A6B);
      fin.position.set(f * 20, 7, 0); L.add(fin);
    }
    if (pt.id === "05") {
      var dial = edged(new THREE.CylinderGeometry(16, 16, 6, 32), 0xEFE7D3);
      dial.position.set(0, h / 2 + 3, 0); L.add(dial);
      var needle = new THREE.Mesh(new THREE.BoxGeometry(12, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: AMBER }));
      needle.position.set(4, h / 2 + 6.5, 0); needle.rotation.y = .6; L.add(needle);
    }
    if (pt.id === "06") {
      var door = edged(new THREE.BoxGeometry(w - 30, h - 10, 4), 0x2E4A6B);
      door.position.set(0, 0, d / 2 + 2); L.add(door);
    }
    if (pt.id === "07") {
      var tank = edged(new THREE.CylinderGeometry(22, 22, w * .6, 24), 0x2E4A6B);
      tank.rotation.z = Math.PI / 2; tank.position.set(0, h / 2 + 22, -d / 4); L.add(tank);
      for (var b = -1; b <= 1; b++) {
        var bushing = edged(new THREE.CylinderGeometry(4, 6, 26, 12), 0x3A5373);
        bushing.position.set(b * 34, h / 2 + 13, d / 4); L.add(bushing);
      }
    }
    if (pt.id === "08") {
      for (var p = -1; p <= 1; p += 2) {
        var pole = edged(new THREE.CylinderGeometry(4, 5, 120, 10), 0x2E4A6B);
        pole.position.set(p * w * .38, 60, 0); L.add(pole);
      }
      var wireMat = new THREE.LineBasicMaterial({ color: IVORY, transparent: true, opacity: .55 });
      [-16, 0, 16].forEach(function (dz) {
        var geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-w * .38, 118, dz), new THREE.Vector3(0, 108, dz), new THREE.Vector3(w * .38, 118, dz)
        ]);
        L.add(new THREE.Line(geo, wireMat));
      });
    }

    L.traverse(function (o) { o.userData.layerIdx = idx; });
    scene.add(L);
    layers.push({ g: L, pt: pt, yBase: 0, yExp: 0, cur: 0, target: 0 });
  }

  var cum = 0, EXP = 92;
  PARTS.forEach(function (pt, idx) {
    buildPart(pt, idx);
    var zBase = cum + pt.h / 2; cum += pt.h + 18;
    var L = layers[idx];
    L.yBase = zBase; L.yExp = zBase + idx * EXP; L.cur = zBase; L.target = zBase;
    L.g.position.y = zBase;
  });

  /* ---------- 注解栏 ---------- */
  if (railR) {
    PARTS.forEach(function (pt, idx) {
      var an = document.createElement("div");
      an.className = "an"; an.dataset.i = idx;
      an.innerHTML = '<span class="no">' + pt.id + '</span><span><span class="nm">' + pt.name + '</span><span class="sp" style="display:block">' + pt.spec + '</span></span>';
      an.addEventListener("mouseenter", function () { hot(idx, true); });
      an.addEventListener("mouseleave", function () { hot(idx, false); });
      an.addEventListener("click", function () { select(idx); });
      railR.appendChild(an);
    });
  }

  /* ---------- 悬停联动 ---------- */
  var locked = -1;
  function setLayerHot(i, on) {
    layers[i].g.traverse(function (o) {
      if (o.userData.edge) o.userData.edge.color.setHex(on ? AMBER : IVORY);
      if (o.userData.mat) o.userData.mat.emissive.setHex(on ? 0x6B4E10 : 0x000000);
    });
  }
  function hot(i, on) {
    setLayerHot(i, on || locked === i);
    if (railR && railR.children[i]) railR.children[i].classList.toggle("hot", on || locked === i);
    if (readout) {
      if (on) readout.innerHTML = "PART <b>" + PARTS[i].id + "</b> · " + PARTS[i].name;
      else if (locked < 0) readout.textContent = "PART —— · 待机";
    }
  }
  function select(i) {
    if (locked >= 0) { setLayerHot(locked, false); if (railR) railR.children[locked].classList.remove("hot"); }
    locked = locked === i ? -1 : i;
    if (locked >= 0) {
      setLayerHot(locked, true);
      if (railR) railR.children[locked].classList.add("hot");
      if (readout) readout.innerHTML = "PART <b>" + PARTS[locked].id + "</b> · " + PARTS[locked].name + " · 已锁定";
    } else if (readout) readout.textContent = "PART —— · 待机";
  }

  var ray = new THREE.Raycaster(), mv = new THREE.Vector2(), hovered = -1;
  canvas.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    mv.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mv.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  });
  canvas.addEventListener("click", function () { if (hovered >= 0) select(hovered); });

  /* ---------- 引出虚线 ---------- */
  var wireEls = [];
  if (wires && railR) {
    PARTS.forEach(function () {
      var pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      pl.setAttribute("fill", "none"); pl.setAttribute("stroke", "rgba(239,231,211,.5)");
      pl.setAttribute("stroke-width", "1"); pl.setAttribute("stroke-dasharray", "5 4");
      wires.appendChild(pl);
      var tri = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      tri.setAttribute("fill", "rgba(239,231,211,.9)");
      wires.appendChild(tri);
      wireEls.push({ pl: pl, tri: tri });
    });
  }
  var anchorV = new THREE.Vector3();
  function updateWires() {
    if (!wires || !railR || !scope) return;
    var mr = scope.getBoundingClientRect();
    var cr = canvas.getBoundingClientRect();
    layers.forEach(function (L, i) {
      var el = wireEls[i], an = railR.children[i];
      if (!el || !an) return;
      anchorV.set(L.pt.w / 2 + 8, L.pt.h / 2, 0);
      L.g.localToWorld(anchorV);
      var v = anchorV.clone().project(camera);
      var x = (v.x * .5 + .5) * cr.width + (cr.left - mr.left);
      var y = (-v.y * .5 + .5) * cr.height + (cr.top - mr.top);
      if (v.z > 1) { el.pl.setAttribute("opacity", "0"); el.tri.setAttribute("opacity", "0"); return; }
      var ar = an.getBoundingClientRect();
      var tx = ar.left - mr.left - 12, ty = ar.top - mr.top + ar.height / 2;
      var midx = (x + tx) / 2 + 20;
      el.pl.setAttribute("points", x.toFixed(1) + "," + y.toFixed(1) + " " + midx.toFixed(1) + "," + ty.toFixed(1) + " " + tx.toFixed(1) + "," + ty.toFixed(1));
      el.pl.setAttribute("opacity", "1");
      var ang = Math.atan2(ty - y, tx - x), sz = 7;
      var p1 = [x + 9 * Math.cos(ang), y + 9 * Math.sin(ang)];
      var p2 = [x - sz * Math.cos(ang - .5), y - sz * Math.sin(ang - .5)];
      var p3 = [x - sz * Math.cos(ang + .5), y - sz * Math.sin(ang + .5)];
      el.tri.setAttribute("points",
        p1.map(function (n) { return n.toFixed(1); }).join(",") + " " +
        p2.map(function (n) { return n.toFixed(1); }).join(",") + " " +
        p3.map(function (n) { return n.toFixed(1); }).join(","));
      el.tri.setAttribute("opacity", "1");
      var on = locked === i || hovered === i;
      el.pl.setAttribute("stroke", on ? "#D9A441" : "rgba(239,231,211,.5)");
      el.tri.setAttribute("fill", on ? "#D9A441" : "rgba(239,231,211,.9)");
    });
  }

  /* ---------- 分解/合拢/旋转 ---------- */
  function setExplode(on) {
    layers.forEach(function (L, i) {
      setTimeout(function () { L.target = on ? L.yExp : L.yBase; }, on ? i * 70 : (layers.length - i) * 50);
    });
    if (opts.btnExplode) document.getElementById(opts.btnExplode).classList.toggle("cur", on);
    if (opts.btnAssemble) document.getElementById(opts.btnAssemble).classList.toggle("cur", !on);
  }
  if (opts.btnExplode) document.getElementById(opts.btnExplode).addEventListener("click", function () { setExplode(true); });
  if (opts.btnAssemble) document.getElementById(opts.btnAssemble).addEventListener("click", function () { setExplode(false); });
  if (opts.btnSpin) document.getElementById(opts.btnSpin).addEventListener("click", function () {
    spinOn = !spinOn; controls.autoRotate = spinOn;
    this.textContent = spinOn ? "旋转 · 开" : "旋转 · 停";
    this.classList.toggle("cur", spinOn);
  });

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (wires && scope) {
      wires.setAttribute("viewBox", "0 0 " + scope.clientWidth + " " + scope.clientHeight);
    }
  }
  addEventListener("resize", resize);
  resize();

  function tick() {
    requestAnimationFrame(tick);
    layers.forEach(function (L) {
      L.cur += (L.target - L.cur) * .09;
      L.g.position.y = L.cur;
    });
    ray.setFromCamera(mv, camera);
    var hits = ray.intersectObjects(scene.children, true);
    var found = -1;
    for (var k = 0; k < hits.length; k++) {
      var li = hits[k].object.userData.layerIdx;
      if (li !== undefined) { found = li; break; }
    }
    if (found !== hovered) {
      if (hovered >= 0 && locked !== hovered) {
        setLayerHot(hovered, false);
        if (railR && railR.children[hovered]) railR.children[hovered].classList.remove("hot");
      }
      hovered = found;
      if (hovered >= 0) hot(hovered, true);
      else if (locked < 0 && readout) readout.textContent = "PART —— · 待机";
      canvas.style.cursor = hovered >= 0 ? "pointer" : "grab";
    }
    controls.update();
    renderer.render(scene, camera);
    updateWires();
  }
  tick();
  setTimeout(function () { setExplode(true); }, 800);

  return { setExplode: setExplode, select: select };
}
