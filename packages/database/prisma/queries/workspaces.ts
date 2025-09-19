import type { z } from "zod";
import { db } from "../client";
import type { OrganizationSchema } from "../zod";

export async function getWorkspaces({
	limit,
	offset,
	query,
}: {
	limit: number;
	offset: number;
	query?: string;
}) {
	return db.organization
		.findMany({
			where: {
				name: { contains: query, mode: "insensitive" },
			},
			include: {
				_count: {
					select: {
						members: true,
					},
				},
			},
			take: limit,
			skip: offset,
		})
		.then((res) =>
			res.map((org) => ({
				...org,
				membersCount: org._count.members,
			})),
		);
}

export async function countAllWorkspaces() {
	return db.organization.count();
}

export async function getWorkspaceById(id: string) {
	return db.organization.findUnique({
		where: { id },
		include: {
			members: true,
			invitations: true,
		},
	});
}

export async function getInvitationById(id: string) {
	return db.invitation.findUnique({
		where: { id },
		include: {
			workspace: true,
		},
	});
}

export async function getWorkspaceBySlug(slug: string) {
	return db.organization.findUnique({
		where: { slug },
	});
}

export async function getWorkspaceMembership(
	workspaceId: string,
	userId: string,
) {
	return db.member.findUnique({
		where: {
			workspaceId_userId: {
				workspaceId,
				userId,
			},
		},
		include: {
			workspace: true,
		},
	});
}

export async function getWorkspaceWithPurchasesAndMembersCount(
	workspaceId: string,
) {
	const workspace = await db.organization.findUnique({
		where: {
			id: workspaceId,
		},
		include: {
			purchases: true,
			_count: {
				select: {
					members: true,
				},
			},
		},
	});

	return workspace
		? {
				...workspace,
				membersCount: workspace._count.members,
			}
		: null;
}

export async function getPendingInvitationByEmail(email: string) {
	return db.invitation.findFirst({
		where: {
			email,
			status: "pending",
		},
	});
}

export async function updateWorkspace(
	workspace: Partial<z.infer<typeof OrganizationSchema>> & { id: string },
) {
	return db.organization.update({
		where: {
			id: workspace.id,
		},
		data: workspace,
	});
}
