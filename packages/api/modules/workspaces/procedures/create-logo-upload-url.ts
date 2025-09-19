import { ORPCError } from "@orpc/server";
import { config } from "@repo/config";
import { getWorkspaceById } from "@repo/database";
import { getSignedUploadUrl } from "@repo/storage";
import z from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../lib/membership";

export const createLogoUploadUrl = protectedProcedure
	.route({
		method: "POST",
		path: "/workspaces/logo-upload-url",
		tags: ["Workspaces"],
		summary: "Create logo upload URL",
		description:
			"Create a signed upload URL to upload an logo image to the storage bucket",
	})
	.input(
		z.object({
			workspaceId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input: { workspaceId } }) => {
		const workspace = await getWorkspaceById(workspaceId);

		if (!workspace) {
			throw new ORPCError("BAD_REQUEST");
		}

		const membership = await verifyWorkspaceMembership(
			workspaceId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const path = `${workspaceId}.png`;
		const signedUploadUrl = await getSignedUploadUrl(path, {
			bucket: config.storage.bucketNames.avatars,
		});

		return { signedUploadUrl, path };
	});
