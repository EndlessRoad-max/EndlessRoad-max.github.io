type Entry = { name: string; count: number };

/** Enhance the complete server-rendered note list; no animation or Canvas needed. */
export function initNotesNavigation() {
  const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const root = el("notes-navigator");
  if (!root || root.dataset.ready) return;
  const notes = [...document.querySelectorAll<HTMLElement>("[data-note]")].map(row => ({
    row, category: row.dataset.category || "未分类", tags: JSON.parse(row.dataset.tags || "[]") as string[],
  }));
  const mobile = matchMedia("(max-width: 600px)");
  const categories = el("notes-categories");
  const tags = el("notes-tags");
  const toggle = el<HTMLButtonElement>("notes-tags-toggle");
  let category = "", tag = "", page = 1, expanded = false;

  function entries(names: string[]): Entry[] {
    const counts = new Map<string, number>();
    for (const name of names) counts.set(name, (counts.get(name) || 0) + 1);
    return [...counts].map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
  }
  function option(name: string, label: string, count?: number) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "notes-filter-option";
    button.dataset.name = name;
    button.textContent = label;
    if (count !== undefined) {
      const number = document.createElement("span");
      number.className = "notes-filter-count";
      number.textContent = String(count);
      number.setAttribute("aria-hidden", "true");
      button.append(number);
      button.setAttribute("aria-label", `${label}，${count} 篇笔记`);
    }
    return button;
  }
  function readURL() {
    const params = new URLSearchParams(location.search);
    category = params.get("category") || "";
    tag = params.get("tag") || "";
    page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
    expanded = false;
  }
  function buildTags() {
    const scoped = notes.filter(n => !category || n.category === category);
    const available = entries(scoped.flatMap(n => [...new Set(n.tags)]));
    // Even an old/invalid selected tag stays visible and can be deselected.
    if (tag && !available.some(entry => entry.name === tag)) available.push({ name: tag, count: 0 });
    tags.replaceChildren(option("", "全部"), ...available.map(entry => option(entry.name, `#${entry.name}`, entry.count)));
  }
  function syncOptions() {
    for (const button of categories.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.name === category));
    }
    const limit = mobile.matches ? 6 : 10;
    const buttons = [...tags.querySelectorAll("button")];
    for (const [index, button] of buttons.entries()) {
      button.setAttribute("aria-pressed", String(button.dataset.name === tag));
      button.hidden = !expanded && index > limit && button.dataset.name !== tag;
    }
    toggle.hidden = !expanded && !buttons.some(button => button.hidden);
    toggle.textContent = expanded ? "收起" : "展开全部标签";
    toggle.setAttribute("aria-expanded", String(expanded));
  }
  function results(write = false) {
    const matching = notes.filter(n => (!category || n.category === category) && (!tag || n.tags.includes(tag)));
    const pages = Math.max(1, Math.ceil(matching.length / 10));
    page = Math.min(page, pages);
    notes.forEach(n => n.row.hidden = true);
    matching.slice((page - 1) * 10, page * 10).forEach(n => n.row.hidden = false);
    const selection = [category, tag && `#${tag}`].filter(Boolean).join(" / ");
    el("notes-count").textContent = `${selection ? `${selection} · ` : ""}共 ${matching.length} 篇笔记`;
    el("notes-empty").hidden = matching.length !== 0;
    el("clear-filters").hidden = !category && !tag;
    el("notes-pagination").hidden = pages <= 1;
    el("page-label").textContent = `${page} / ${pages}`;
    el<HTMLButtonElement>("prev-page").disabled = page <= 1;
    el<HTMLButtonElement>("next-page").disabled = page >= pages;
    syncOptions();
    if (write) {
      const params = new URLSearchParams(location.search);
      for (const key of ["category", "tag", "page"]) params.delete(key);
      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
      if (page > 1) params.set("page", String(page));
      history.pushState(null, "", location.pathname + (params.size ? `?${params}` : "") + location.hash);
    }
  }
  function selectCategory(name: string) {
    category = name; tag = ""; page = 1; expanded = false;
    buildTags(); results(true);
  }
  categories.replaceChildren(option("", "全部"), ...entries(notes.map(n => n.category)).map(entry => option(entry.name, entry.name, entry.count)));
  categories.addEventListener("click", event => {
    const button = (event.target as HTMLElement).closest("button");
    if (button) selectCategory(button.dataset.name || "");
  });
  tags.addEventListener("click", event => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    tag = button.dataset.name === tag ? "" : button.dataset.name || "";
    page = 1; results(true);
    // A selected tag outside the collapsed set can hide when deselected.
    if (button.hidden) tags.querySelector("button")?.focus({ preventScroll: true });
  });
  toggle.addEventListener("click", () => { expanded = !expanded; syncOptions(); });
  el("clear-filters").addEventListener("click", () => {
    selectCategory("");
    categories.querySelector("button")?.focus({ preventScroll: true });
  });
  el("prev-page").addEventListener("click", () => { page--; results(true); });
  el("next-page").addEventListener("click", () => { page++; results(true); });
  mobile.addEventListener("change", () => {
    const focused = document.activeElement as HTMLElement | null;
    syncOptions();
    if (focused?.hidden && tags.contains(focused)) toggle.focus({ preventScroll: true });
  });
  window.addEventListener("popstate", () => { readURL(); buildTags(); results(); });
  readURL(); buildTags(); results();
  root.hidden = false;
  root.dataset.ready = "true";
}
