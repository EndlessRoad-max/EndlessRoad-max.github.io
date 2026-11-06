type Entry = { name: string; count: number };

/** Progressive enhancement: the server-rendered note list remains usable without JS. */
export function initNotesGalaxy() {
  const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const root = el("knowledge-galaxy");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  const map = el("galaxy-map");
  const canvas = el<HTMLCanvasElement>("galaxy-canvas");
  let ctx: CanvasRenderingContext2D | null = null;
  try { ctx = canvas.getContext("2d"); } catch { /* Buttons remain available. */ }
  const core = el<HTMLButtonElement>("galaxy-core");
  const nodes = el("galaxy-nodes");
  const list = el("galaxy-list");
  const motion = el<HTMLButtonElement>("galaxy-motion");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 600px)");
  const notes = [...document.querySelectorAll<HTMLElement>("[data-note]")].map(row => ({
    row, category: row.dataset.category || "未分类", tags: JSON.parse(row.dataset.tags || "[]") as string[],
  }));
  const categories = [...new Set(notes.map(n => n.category))].sort();
  let category = "", tag = "", page = 1, group = 0;
  let entries: Entry[] = [];
  let buttons: HTMLButtonElement[] = [];
  let angle = -Math.PI / 2, width = 1, height = 1;
  let paused = reduced.matches, hover = false, visible = true;
  let frame = 0, last = 0;
  let layer: HTMLCanvasElement | null = null;
  const capacity = () => mobile.matches ? 4 : 6;
  const orbit = () => ({ x: Math.max(1, width / 2 - (mobile.matches ? 43 : 73)), y: height / 2 - (mobile.matches ? 48 : 67) });

  function readURL() {
    const params = new URLSearchParams(location.search);
    category = params.get("category") || "";
    tag = params.get("tag") || "";
    page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
    group = 0;
  }
  function results(write = false) {
    const matching = notes.filter(n => (!category || n.category === category) && (!tag || n.tags.includes(tag)));
    const pages = Math.max(1, Math.ceil(matching.length / 10));
    page = Math.min(page, pages);
    notes.forEach(n => n.row.hidden = true);
    matching.slice((page - 1) * 10, page * 10).forEach(n => n.row.hidden = false);
    el("notes-count").textContent = `${[category, tag && `#${tag}`].filter(Boolean).join(" / ")}${category || tag ? " · " : ""}共 ${matching.length} 篇笔记`;
    el("notes-empty").hidden = matching.length !== 0;
    el("clear-filters").hidden = !category && !tag;
    el("notes-pagination").hidden = false;
    el("page-label").textContent = `${page} / ${pages}`;
    el<HTMLButtonElement>("prev-page").disabled = page <= 1;
    el<HTMLButtonElement>("next-page").disabled = page >= pages;
    if (write) {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
      if (page > 1) params.set("page", String(page));
      history.pushState(null, "", location.pathname + (params.size ? `?${params}` : "") + location.hash);
    }
  }
  function select(name: string) {
    if (category) {
      tag = tag === name ? "" : name;
      page = 1;
      results(true);
      const index = entries.findIndex(entry => entry.name === tag);
      if (index >= 0 && Math.floor(index / capacity()) !== group) {
        group = Math.floor(index / capacity()); buildNodes();
      } else syncSelected();
    } else {
      category = name; tag = ""; page = 1; group = 0;
      render(true, true);
      core.focus({ preventScroll: true });
    }
  }
  function syncSelected() {
    for (const button of [...buttons, ...list.querySelectorAll("button")]) {
      button.setAttribute("aria-pressed", String(!!category && button.dataset.name === tag));
    }
    core.setAttribute("aria-label", categories.includes(category) ? `${category}，清除标签筛选` : "笔记本，显示全部笔记");
  }
  function buildNodes() {
    const focusedName = nodes.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.name : undefined;
    group = Math.min(group, Math.max(0, Math.ceil(entries.length / capacity()) - 1));
    nodes.replaceChildren();
    buttons = entries.slice(group * capacity(), (group + 1) * capacity()).map(entry => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "galaxy-node"; button.dataset.name = entry.name;
      button.setAttribute("aria-label", `${entry.name}，${entry.count} 篇笔记`);
      const label = document.createElement("strong"); label.textContent = entry.name;
      const count = document.createElement("span"); count.textContent = `${entry.count} 篇`;
      button.append(label, count);
      button.addEventListener("click", () => select(entry.name));
      nodes.append(button);
      return button;
    });
    const groups = Math.max(1, Math.ceil(entries.length / capacity()));
    el("galaxy-groups").hidden = groups <= 1;
    el("galaxy-group-label").textContent = `${group + 1} / ${groups}`;
    el<HTMLButtonElement>("galaxy-prev").disabled = group === 0;
    el<HTMLButtonElement>("galaxy-next").disabled = group >= groups - 1;
    syncSelected();
    positionNodes();
    if (focusedName) (buttons.find(b => b.dataset.name === focusedName) || core).focus({ preventScroll: true });
    syncMotion();
  }
  function render(write = false, transition = false) {
    results(write);
    const scoped = notes.filter(n => n.category === category);
    entries = category
      ? [...new Set(scoped.flatMap(n => n.tags))].sort().map(name => ({ name, count: scoped.filter(n => n.tags.includes(name)).length }))
      : categories.map(name => ({ name, count: notes.filter(n => n.category === name).length }));
    core.querySelector("strong")!.textContent = categories.includes(category) ? category : "笔记本";
    core.querySelector("span")!.textContent = category && categories.includes(category) ? `${scoped.length} 篇笔记` : `${notes.length} 篇笔记`;
    el("galaxy-path").textContent = category ? `/ ${category}` : "";
    el("galaxy-hint").textContent = category ? "点击标签筛选笔记 · 点击中心清除标签" : "点击主题，进入它的标签星系";
    list.replaceChildren();
    for (const entry of entries) {
      const button = document.createElement("button"); button.type = "button"; button.dataset.name = entry.name;
      button.textContent = `${entry.name} (${entry.count})`;
      button.addEventListener("click", () => select(entry.name)); list.append(button);
    }
    if (!entries.length) list.textContent = "没有可用标签，可返回全部主题。";
    const selectedIndex = entries.findIndex(e => e.name === tag);
    if (selectedIndex >= 0) group = Math.floor(selectedIndex / capacity());
    buildNodes();
    if (transition && !reduced.matches) {
      canvas.animate([{ transform: "scale(1.08)", opacity: .5 }, { transform: "scale(1)", opacity: 1 }], { duration: 420, easing: "ease-out" });
    }
  }
  function positionNodes() {
    const radius = orbit();
    buttons.forEach((button, index) => {
      const a = angle + index * Math.PI * 2 / buttons.length;
      button.style.left = `${width / 2 + Math.cos(a) * radius.x}px`;
      button.style.top = `${height / 2 + Math.sin(a) * radius.y}px`;
    });
  }

  // Seeded particles, rasterized once per size; animation rotates the cached galaxy.
  function makeLayer() {
    if (!ctx) return;
    layer = document.createElement("canvas"); layer.width = layer.height = mobile.matches ? 720 : 1100;
    const paint = layer.getContext("2d");
    if (!paint) { layer = null; return; }
    let seed = 417;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const size = layer.width;
    paint.translate(size / 2, size / 2);
    const glow = paint.createRadialGradient(0, 0, 0, 0, 0, size * .27);
    glow.addColorStop(0, "#fff0ceaa"); glow.addColorStop(.12, "#e5d8bc65"); glow.addColorStop(.4, "#8c9bb52b"); glow.addColorStop(1, "#728ab000");
    paint.fillStyle = glow; paint.fillRect(-size / 2, -size / 2, size, size);
    for (let i = 0; i < (mobile.matches ? 3800 : 9500); i++) {
      const r = Math.pow(random(), .85) * size * .46;
      const arm = i % 3 * Math.PI * 2 / 3;
      const a = arm + r / size * 9 + (random() - .5) * (0.3 + .8 * r / size);
      const scatter = (random() - .5) * size * .035;
      const x = Math.cos(a) * r + scatter, y = Math.sin(a) * r + scatter;
      const alpha = .13 + random() * .48;
      paint.fillStyle = r < size * .1 ? `rgba(255,236,202,${alpha})` : `rgba(170,193,230,${alpha})`;
      paint.beginPath(); paint.arc(x, y, .35 + random() ** 3 * 1.3, 0, Math.PI * 2); paint.fill();
    }
    for (let i = 0; i < 1500; i++) {
      const r = random() ** 1.8 * size * .18, a = random() * Math.PI * 2;
      paint.fillStyle = `rgba(255,239,214,${random() * .45})`;
      paint.fillRect(Math.cos(a) * r, Math.sin(a) * r, .8, .8);
    }
  }
  function draw() {
    if (!ctx) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < (mobile.matches ? 65 : 130); i++) {
      const x = ((i * 127.31 + 17) % 997) / 997 * width;
      const y = ((i * 233.17 + 29) % 991) / 991 * height;
      ctx.fillStyle = i % 7 ? "#afbdd63b" : "#d2deef8c";
      ctx.fillRect(x, y, i % 7 ? .8 : 1.3, i % 7 ? .8 : 1.3);
    }
    if (layer) {
      ctx.save(); ctx.translate(width / 2, height / 2);
      ctx.scale(width / 2, (height / 2) * .88);
      ctx.rotate(angle);
      ctx.drawImage(layer, -1, -1, 2, 2); ctx.restore();
    }
  }
  function blocked() { return paused || hover || map.contains(document.activeElement) || !visible || document.hidden; }
  function tick(now: number) {
    frame = 0;
    if (blocked()) return;
    if (last) angle = (angle + Math.min(now - last, 100) * Math.PI * 2 / 240000) % (Math.PI * 2);
    last = now;
    positionNodes(); draw(); frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    motion.textContent = paused ? "继续公转" : "暂停公转";
    motion.setAttribute("aria-pressed", String(paused));
    el("galaxy-motion-status").textContent = paused ? "公转已暂停" : blocked() ? "探索时暂停" : "缓慢公转中 · 240 秒 / 周";
    map.dataset.moving = String(!blocked());
    if (!blocked()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = map.clientWidth; height = map.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    makeLayer(); buildNodes(); draw();
  }
  function clear() {
    category = ""; tag = ""; page = 1; group = 0; render(true, true);
  }
  el("galaxy-home").addEventListener("click", clear);
  el("clear-filters").addEventListener("click", clear);
  core.addEventListener("click", () => {
    if (category && !categories.includes(category)) { clear(); return; }
    tag = ""; page = 1; results(true); syncSelected();
  });
  el("prev-page").addEventListener("click", () => { page--; results(true); });
  el("next-page").addEventListener("click", () => { page++; results(true); });
  el("galaxy-prev").addEventListener("click", () => { group--; buildNodes(); });
  el("galaxy-next").addEventListener("click", () => { group++; buildNodes(); });
  el("galaxy-list-toggle").addEventListener("click", () => {
    list.hidden = !list.hidden;
    el("galaxy-list-toggle").setAttribute("aria-expanded", String(!list.hidden));
  });
  motion.addEventListener("click", () => { paused = !paused; syncMotion(); });
  map.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") { hover = true; syncMotion(); } });
  map.addEventListener("pointerleave", () => { hover = false; syncMotion(); });
  map.addEventListener("pointerdown", event => { if (event.pointerType !== "mouse") { paused = true; syncMotion(); } });
  map.addEventListener("focusin", syncMotion);
  map.addEventListener("focusout", () => queueMicrotask(syncMotion));
  reduced.addEventListener("change", () => { paused = reduced.matches; syncMotion(); });
  mobile.addEventListener("change", resize);
  document.addEventListener("visibilitychange", syncMotion);
  window.addEventListener("popstate", () => { readURL(); render(); });
  window.addEventListener("pagehide", () => cancelAnimationFrame(frame));
  window.addEventListener("pageshow", syncMotion);
  root.hidden = false;
  readURL(); render(); resize();
  new ResizeObserver(resize).observe(map);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }).observe(map);
}
