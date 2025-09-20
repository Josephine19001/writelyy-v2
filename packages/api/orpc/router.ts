import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { aiRouter } from "../modules/ai/router";
import { contactRouter } from "../modules/contact/router";
import { documentsRouter } from "../modules/documents/router";
import { foldersRouter } from "../modules/folders/router";
import { newsletterRouter } from "../modules/newsletter/router";
import { paymentsRouter } from "../modules/payments/router";
import { sourcesRouter } from "../modules/sources/router";
import { usersRouter } from "../modules/users/router";
import { workspacesRouter } from "../modules/workspaces/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure
	// Prefix for openapi
	.prefix("/api")
	.router({
		admin: adminRouter,
		newsletter: newsletterRouter,
		contact: contactRouter,
		workspaces: workspacesRouter,
		users: usersRouter,
		payments: paymentsRouter,
		ai: aiRouter,
		documents: documentsRouter,
		folders: foldersRouter,
		sources: sourcesRouter,
	});

export type ApiRouterClient = RouterClient<typeof router>;
