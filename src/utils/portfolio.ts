import { getCollection } from "astro:content";
import { url } from "./url-utils";

export async function publishedNotes() {
  return (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) =>
      (b.data.updated ?? b.data.published).valueOf() -
      (a.data.updated ?? a.data.published).valueOf(),
  );
}
export async function publishedProjects() {
  return (await getCollection("projects", ({ data }) => !data.draft)).sort(
    (a, b) => a.data.order - b.data.order || a.slug.localeCompare(b.slug),
  );
}
export function asset(path: string) {
  return /^https?:\/\//.test(path) ? path : url(path);
}
export function dateLabel(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}
