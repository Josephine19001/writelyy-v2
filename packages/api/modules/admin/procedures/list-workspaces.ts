import { ORPCError } from "@orpc/client";
import {
	countAllWorkspaces,
	getWorkspaceById as getWorkspaceByIdFn,
	getWorkspaces,
} from "@repo/database";
import { z } from "zod";
import { adminProcedure } from "../../../orpc/procedures";

export const listWorkspaces = adminProcedure
	.route({
		method: "GET",
		path: "/admin/workspaces",
		tags: ["Administration"],
		summary: "List workspaces",
	})
	.input(
		z.object({
			query: z.string().optional(),
			limit: z.number().min(1).max(100).default(10),
			offset: z.number().min(0).default(0),
		}),
	)
	.handler(async ({ input: { query, limit, offset } }) => {
		const workspaces = await getWorkspaces({
			limit,
			offset,
			query,
		});

		const total = await countAllWorkspaces();

		return { workspaces, total };
	});

export const getWorkspaceById = adminProcedure
	.route({
		method: "GET",
		path: "/admin/workspaces/{id}",
		tags: ["Administration"],
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input: { id } }) => {
		const workspace = await getWorkspaceByIdFn(id);

		if (!workspace) {
			throw new ORPCError("NOT_FOUND");
		}

		return workspace;
	});
