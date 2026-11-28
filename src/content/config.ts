import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		format: z.enum(["markdown", "html", "pdf", "file"]).default("markdown"),
		target: z.string().regex(/^\/(?!\/)[^\\?#]*$/, "使用站内绝对路径，例如 /mysql/").optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}).superRefine((data, ctx) => {
		if (data.format !== "markdown" && !data.target) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "非 Markdown 笔记必须填写 target" });
		}
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	projects: defineCollection({
		schema: z.object({
			title: z.string(),
			description: z.string(),
			tags: z.array(z.string()).default([]),
			status: z.string().default("进行中"),
			image: z.string().default(""),
			source: z.string().url().optional(),
			demo: z.string().url().optional(),
			featured: z.boolean().default(false),
			order: z.number().default(100),
			draft: z.boolean().default(false),
		}),
	}),
};
