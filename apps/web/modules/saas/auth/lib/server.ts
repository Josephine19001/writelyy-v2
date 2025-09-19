import "server-only";
import { auth } from "@repo/auth";
import { getInvitationById } from "@repo/database";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
		query: {
			disableCookieCache: true,
		},
	});

	return session;
});

export const getActiveWorkspace = cache(async (slug: string) => {
	try {
		const activeWorkspace = await auth.api.getFullWorkspace({
			query: {
				workspaceSlug: slug,
			},
			headers: await headers(),
		});

		return activeWorkspace;
	} catch {
		return null;
	}
});

export const getWorkspaceList = cache(async () => {
	try {
		const workspaceList = await auth.api.listWorkspaces({
			headers: await headers(),
		});

		return workspaceList;
	} catch {
		return [];
	}
});

export const getUserAccounts = cache(async () => {
	try {
		const userAccounts = await auth.api.listUserAccounts({
			headers: await headers(),
		});

		return userAccounts;
	} catch {
		return [];
	}
});

export const getUserPasskeys = cache(async () => {
	try {
		const userPasskeys = await auth.api.listPasskeys({
			headers: await headers(),
		});

		return userPasskeys;
	} catch {
		return [];
	}
});

export const getInvitation = cache(async (id: string) => {
	try {
		return await getInvitationById(id);
	} catch {
		return null;
	}
});
