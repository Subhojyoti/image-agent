const A = "assets/";
const NAMES = `rw_art_deco_1920s_normal_vision_8b
rw_autumn_vineyard_normal_vision_8b
rw_baroque_1700s_normal_vision_8b
rw_coastal_time_complex_text_8b
rw_futuristic_architecture_complex_text_8b
rw_grandmother_motion_complex_text_8b
rw_robot_architecture_complex_vision_8b
rw_rolling_glow_complex_text_8b
rw_textured_season_complex_vision_8b
rw_tropical_time_period_complex_text_8b
rw_winter_bare_normal_vision_8b
rw_winter_scene_normal_vision_8b
rwsw_classic_library_b_normal_text_4b
rwsw_classic_library_normal_text_4b
rwsw_industrial_loft_normal_text_4b
rwsw_industrial_loft_normal_vision_4b
rwsw_minimalist_bathroom_normal_vision_4b
rwsw_modern_square_normal_text_8b
rwsw_mountain_rocky_normal_text_8b
rwsw_plains_grassland_normal_text_8b
rwsw_traditional_bedroom_normal_vision_4b
rwsw_winter_scene_normal_text_8b
sw_1920s_lighting_complex_vision_4b
sw_ancient_classical_simple_text_4b
sw_canyon_valley_simple_text_4b
sw_cherry_atmospheric_complex_text_4b
sw_dancer_architecture_complex_vision_4b
sw_dancer_artistic_medium_complex_vision_4b
sw_flowing_era_complex_vision_4b
sw_historic_atmospheric_complex_vision_4b
sw_magical_depth_complex_text_4b
sw_market_grain_complex_text_4b
sw_medieval_lens_complex_text_4b
sw_office_lens_character_complex_vision_4b
sw_space_color_temperature_complex_vision_4b
rw_dancer_complex_vision_8b_v2
rw_urban_city_normal_vision_8b
rwsw_traditional_bedroom_normal_text_4b
rwsw_victorian_1800s_normal_text_8b_v2
sw_canyon_valley_simple_text_4b_v2
sw_regular_building_simple_text_4b
sw_rooftop_complex_vision_4b_v2`.split("\n");

const METHODS = ["Original", "Baseline", "Edit-Only", "Standard", "RL", "DPO", "RW (ours)", "SW (ours)", "GPT-4o planner", "Gemini 2.5 planner"];

function parse(n) {
  const tier = n.includes("_simple_") ? "Simple" : n.includes("_normal_") ? "Regular" : "Complex";
  const mod = n.includes("_vision_") ? "Vision" : "Text";
  const size = n.includes("_4b") ? "4B" : "8B";
  const title = n.replace(/^(rwsw|rw|sw)_/, "").replace(/_(simple|normal|complex)_(text|vision)_(4b|8b)(_v2)?$/, "")
    .replace(/_b$/, " 2").replace(/_/g, " ");
  return { n, tier, mod, size, title: title.charAt(0).toUpperCase() + title.slice(1) };
}
const ITEMS = NAMES.map(parse);

// Hero marquee
function fillTrack(id, list) {
  const el = document.getElementById(id);
  const html = list.map(it => `<img src="${A}tiles/${it.n}_7.webp" alt="" loading="lazy">`).join("");
  el.innerHTML = html + html;
}
const sh = a => a.slice().sort(() => Math.random() - .5);
fillTrack("track-a", sh(ITEMS).slice(0, 14));
fillTrack("track-b", sh(ITEMS).slice(0, 14));
fillTrack("track-c", sh(ITEMS).slice(0, 14));

// Explorer
let cur = ITEMS.find(i => i.n === "sw_canyon_valley_simple_text_4b_v2") || ITEMS[0];
let curM = 7, tier = "All";
const $ = id => document.getElementById(id);

function showEx() {
  $("ex-orig").src = `${A}tiles/${cur.n}_0.webp`;
  $("ex-out").src = `${A}tiles/${cur.n}_${curM}.webp`;
  $("ex-method-label").textContent = METHODS[curM];
  $("ex-prompt").src = `${A}tiles/${cur.n}_prompt.webp`;
  $("ex-strip").src = `${A}strips/${cur.n}.webp`;
  document.querySelectorAll("#thumbs img").forEach(t => t.classList.toggle("active", t.dataset.n === cur.n));
  document.querySelectorAll("#method-chips .chip").forEach(c => c.classList.toggle("active", +c.dataset.m === curM));
}
function renderThumbs() {
  $("thumbs").innerHTML = ITEMS.filter(i => tier === "All" || i.tier === tier)
    .map(i => `<img src="${A}tiles/${i.n}_0.webp" data-n="${i.n}" title="${i.title} (${i.tier}, ${i.mod}-${i.size})" loading="lazy">`).join("");
  $("thumbs").querySelectorAll("img").forEach(t => t.addEventListener("click", () => {
    cur = ITEMS.find(i => i.n === t.dataset.n); showEx();
  }));
  showEx();
}
$("filter-chips").innerHTML = ["All", "Simple", "Regular", "Complex"].map(t => `<button class="chip${t === "All" ? " active" : ""}" data-t="${t}">${t}</button>`).join("");
$("filter-chips").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
  $("filter-chips").querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
  b.classList.add("active"); tier = b.dataset.t; renderThumbs();
}));
$("method-chips").innerHTML = METHODS.map((m, i) => i === 0 ? "" : `<button class="chip${i === 7 ? " ours" : ""}" data-m="${i}">${m}</button>`).join("");
$("method-chips").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { curM = +b.dataset.m; showEx(); }));
renderThumbs();

// Gallery
const gal = ITEMS.filter(i => i.n.startsWith("sw") || i.n.startsWith("rw"));
$("masonry").innerHTML = sh(gal).map(i => {
  const col = i.n.startsWith("rw_") ? 6 : 7;
  return `<div class="m-card"><img class="after" src="${A}tiles/${i.n}_${col}.webp" loading="lazy" alt="${i.title}">
  <img class="before" src="${A}tiles/${i.n}_0.webp" loading="lazy" alt=""><span>${i.title}</span></div>`;
}).join("");
document.querySelectorAll(".m-card").forEach(c => c.addEventListener("click", () => c.classList.toggle("flip")));

// Reasoning examples
$("reason-rows").innerHTML = [1, 2, 3].map(k => ["original", "baseline", "ground_truth", "sw"].map((t, j) =>
  `<figure><img src="${A}orig/example${k}_${t}.webp" loading="lazy" alt="${t}"><figcaption class="${t === "sw" ? "ours" : ""}">${["Original", "Direct-edit baseline", "Ground truth", "SW planner (ours)"][j]}</figcaption></figure>`).join("")).map(r => `<div class="ex-row">${r}</div>`).join("");

// Dataset before/after
const CMP = [["normal", "Regular"], ["complex", "Complex"], ["complexv2", "Complex (second split)"]];
$("compare-grid").innerHTML = CMP.map(([k, l]) => `<div class="cmp"><div class="cmp-img">
  <img src="${A}orig/${k}_edited.webp" alt="" loading="lazy"><img class="top" src="${A}orig/${k}_original.webp" alt="" loading="lazy" style="clip-path:inset(0 50% 0 0)">
  <input type="range" min="0" max="100" value="50" aria-label="Compare"></div><div class="cmp-l">${l}<small>original | edited</small></div></div>`).join("");
document.querySelectorAll(".cmp input").forEach(r => r.addEventListener("input", () => {
  r.parentElement.querySelector(".top").style.clipPath = `inset(0 ${100 - r.value}% 0 0)`;
}));

// Pipeline
const STAGES = [
  ["Context extraction", "A VLM extracts structured context from the base image and the editing goal, describing the image's current state along every tool dimension."],
  ["Action planning", "A VLM planner writes a chain-of-thought and selects a sequence of tool calls, one reasoning step per action."],
  ["Instruction synthesis", "Each plan step is turned into a precise edit instruction for the frozen image editor."],
  ["Editing and reward", "The editor produces the image and a VLM reward model scores it. These quality scores drive RW and SW training."]
];
STAGES.forEach((s, i) => {
  const b = document.createElement("button");
  b.className = "step" + (i === 0 ? " active" : "");
  b.innerHTML = `<span>${i + 1}</span>${s[0]}`;
  b.addEventListener("click", () => {
    $("steps").querySelectorAll(".step").forEach(x => x.classList.remove("active"));
    b.classList.add("active"); $("stage-text").textContent = s[1];
  });
  $("steps").appendChild(b);
});
$("stage-text").textContent = STAGES[0][1];

// Results: [B,E,S,R,RW,SW,D,GPT-4o,Gemini 2.5]
const COLS = ["B", "E", "S", "R", "RW", "SW", "D", "GPT-4o", "Gemini 2.5"];
const R = {
  Simple: {
    "Text-4B": { "GPT-5.4": [79.60,66.37,79.91,78.53,76.50,82.54,81.03,81.07,64.11], "Gemini 3.1": [90.23,64.24,90.95,90.84,88.75,92.12,90.19,89.38,69.58], "Claude Opus 4.6": [68.06,52.77,69.81,68.03,64.19,70.97,69.23,67.48,54.89] },
    "Text-8B": { "GPT-5.4": [76.05,64.17,76.27,76.59,75.58,76.82,76.26,78.43,62.53], "Gemini 3.1": [86.69,58.87,87.01,87.53,87.76,87.89,88.05,88.98,64.62], "Claude Opus 4.6": [63.89,52.30,64.22,62.41,63.75,64.89,64.78,66.70,53.84] },
    "Vision-4B": { "GPT-5.4": [77.27,65.18,77.43,77.38,76.78,76.76,77.72,78.08,62.89], "Gemini 3.1": [88.33,61.54,87.30,88.05,87.93,88.26,87.90,89.54,63.87], "Claude Opus 4.6": [65.33,52.60,65.29,66.00,64.01,64.77,65.89,67.36,53.46] },
    "Vision-8B": { "GPT-5.4": [76.81,62.60,75.63,76.07,75.99,76.46,76.85,78.16,62.46], "Gemini 3.1": [88.08,60.45,87.08,88.13,87.38,87.74,87.82,89.17,63.95], "Claude Opus 4.6": [65.84,52.72,64.05,64.59,64.48,64.72,65.41,67.12,53.65] }
  },
  Regular: {
    "Text-4B": { "GPT-5.4": [71.68,59.55,72.05,75.22,80.29,78.84,73.97,72.83,60.19], "Gemini 3.1": [83.19,56.69,82.73,85.34,89.11,87.92,83.56,85.66,60.48], "Claude Opus 4.6": [57.12,46.03,55.53,58.72,61.20,59.97,57.84,58.55,50.50] },
    "Text-8B": { "GPT-5.4": [67.93,61.89,68.73,69.49,72.53,74.21,67.97,62.11,62.39], "Gemini 3.1": [78.20,57.25,76.73,80.01,83.41,85.38,76.73,59.43,59.48], "Claude Opus 4.6": [53.25,50.84,55.29,54.35,58.75,60.39,51.88,50.55,50.22] },
    "Vision-4B": { "GPT-5.4": [75.01,59.77,74.76,74.38,80.33,78.60,75.26,76.40,60.94], "Gemini 3.1": [88.73,60.96,84.58,87.95,92.02,90.08,89.04,89.26,64.01], "Claude Opus 4.6": [59.54,47.45,56.18,57.36,63.95,61.96,57.73,60.09,50.30] },
    "Vision-8B": { "GPT-5.4": [64.29,57.60,64.61,64.90,66.88,64.13,64.42,59.67,58.65], "Gemini 3.1": [72.08,58.59,73.64,73.37,75.67,73.96,72.51,60.86,60.23], "Claude Opus 4.6": [50.83,49.17,51.04,51.21,53.02,51.01,50.50,48.82,49.72] }
  },
  Complex: {
    "Text-4B": { "GPT-5.4": [81.56,73.21,83.19,83.34,82.25,86.37,81.81,84.58,64.41], "Gemini 3.1": [92.86,56.31,94.06,93.39,92.56,95.50,93.80,93.31,63.43], "Claude Opus 4.6": [71.03,48.67,71.22,71.28,68.31,74.86,71.22,72.92,53.35] },
    "Text-8B": { "GPT-5.4": [80.77,72.18,80.96,80.94,84.55,81.50,81.67,82.79,63.92], "Gemini 3.1": [92.89,54.88,92.72,91.33,94.70,89.98,92.66,92.47,65.62], "Claude Opus 4.6": [70.64,49.33,70.01,69.83,73.09,68.19,71.11,70.76,52.45] },
    "Vision-4B": { "GPT-5.4": [83.14,69.98,84.05,84.11,83.49,86.09,83.53,83.40,63.64], "Gemini 3.1": [93.89,53.66,93.67,94.45,93.65,96.27,93.55,92.64,64.14], "Claude Opus 4.6": [71.82,48.40,73.73,74.52,72.62,76.24,72.48,71.37,52.30] },
    "Vision-8B": { "GPT-5.4": [83.24,70.74,80.61,80.13,84.67,82.48,83.18,82.02,63.99], "Gemini 3.1": [92.44,53.21,92.00,92.84,96.47,92.61,92.64,94.65,66.34], "Claude Opus 4.6": [71.70,48.70,71.53,69.27,74.73,71.60,71.23,73.23,54.03] }
  }
};
let rs = { ds: "Complex", cfg: "Text-4B", judge: "GPT-5.4" };
function chips(id, list, key) {
  $(id).innerHTML = list.map(x => `<button class="chip${rs[key] === x ? " active" : ""}" data-v="${x}">${x}</button>`).join("");
  $(id).querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { rs[key] = b.dataset.v; drawR(); }));
}
function drawR() {
  chips("r-ds", Object.keys(R), "ds");
  chips("r-cfg", Object.keys(R.Simple), "cfg");
  chips("r-judge", ["GPT-5.4", "Gemini 3.1", "Claude Opus 4.6"], "judge");
  const v = R[rs.ds][rs.cfg][rs.judge];
  const trained = [0, 1, 2, 3, 4, 5, 6];
  const best = Math.max(...trained.map(i => v[i]));
  const lo = Math.min(...v) - 5, hi = Math.max(...v) + 1;
  $("bars").innerHTML = v.map((x, i) => {
    const w = ((x - lo) / (hi - lo)) * 100;
    const cls = (i === 4 || i === 5 ? "ours " : "") + (i > 6 ? "ref " : "") + (x === best && i <= 6 ? "best" : "");
    return `<div class="bar"><span class="bl">${COLS[i]}</span><div class="bt"><div class="bf ${cls}" style="width:${w}%"></div></div><span class="bv">${x.toFixed(2)}</span></div>`;
  }).join("");
}
drawR();

// Count-up
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.to, suf = el.dataset.suf || "", t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / 1100, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
  io.unobserve(el);
}), { threshold: 0.5 });
document.querySelectorAll(".count").forEach(el => io.observe(el));

// Scroll reveal
const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { threshold: 0.08 });
document.querySelectorAll("section .card, section figure, .abstract, .explorer, .bars").forEach(el => { el.classList.add("rev-in"); rv.observe(el); });

$("copy-bib").addEventListener("click", e => {
  navigator.clipboard.writeText($("bib").textContent);
  e.target.textContent = "Copied";
  setTimeout(() => (e.target.textContent = "Copy"), 1500);
});
