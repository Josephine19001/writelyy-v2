import { ORPCError } from "@orpc/client";
import { getWorkspaceById as getWorkspaceByIdFn } from "@repo/database";
import { z } from "zod";
import { adminProcedure } from "../../../orpc/procedures";

export const findWorkspace = adminProcedure
	.route({
		method: "GET",
		path: "/admin/workspaces/{id}",
		tags: ["Administration"],
		summary: "Find workspace by ID",
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
