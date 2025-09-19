import { ORPCError } from "@orpc/client";
import { getWorkspaceBySlug } from "@repo/database";
import slugify from "@sindresorhus/slugify";
import { nanoid } from "nanoid";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const generateWorkspaceSlug = publicProcedure
	.route({
		method: "GET",
		path: "/workspaces/generate-slug",
		tags: ["Workspaces"],
		summary: "Generate workspace slug",
		description: "Generate a unique slug from an workspace name",
	})
	.input(
		z.object({
			name: z.string(),
		}),
	)
	.handler(async ({ input: { name } }) => {
		const baseSlug = slugify(name, {
			lowercase: true,
		});

		let slug = baseSlug;
		let hasAvailableSlug = false;

		for (let i = 0; i < 3; i++) {
			const existing = await getWorkspaceBySlug(slug);

			if (!existing) {
				hasAvailableSlug = true;
				break;
			}

			slug = `${baseSlug}-${nanoid(5)}`;
		}

		if (!hasAvailableSlug) {
			throw new ORPCError("INTERNAL_SERVER_ERROR");
		}

		return { slug };
	});
