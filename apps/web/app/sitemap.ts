import { getAllPosts } from "@marketing/blog/utils/lib/posts";
import { config } from "@repo/config";
import { getBaseUrl } from "@repo/utils";
import { allLegalPages } from "content-collections";
import type { MetadataRoute } from "next";
import { docsSource } from "./docs-source";

const baseUrl = getBaseUrl();
const locales = config.i18n.enabled
	? Object.keys(config.i18n.locales)
	: [config.i18n.defaultLocale];

const staticMarketingPages = ["", "/changelog"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getAllPosts();

	return [
		...staticMarketingPages.flatMap((page) =>
			locales.map((locale) => ({
				url: new URL(`/${locale}${page}`, baseUrl).href,
				lastModified: new Date(),
				changeFrequency: page === "" ? "daily" as const : "weekly" as const,
				priority: page === "" ? 1 : 0.8,
			})),
		),
		...posts.map((post) => ({
			url: new URL(`/${post.locale}/blog/${post.path}`, baseUrl).href,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.6,
		})),
		...allLegalPages.map((page) => ({
			url: new URL(`/${page.locale}/legal/${page.path}`, baseUrl).href,
			lastModified: new Date("2025-10-11"),
			changeFrequency: "monthly" as const,
			priority: 0.3,
		})),
		...docsSource.getLanguages().flatMap((locale) =>
			docsSource.getPages(locale.language).map((page) => ({
				url: new URL(
					`/${locale.language}/docs/${page.slugs.join("/")}`,
					baseUrl,
				).href,
				lastModified: new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.7,
			})),
		),
	];
}
