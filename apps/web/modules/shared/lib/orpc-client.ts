import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ApiRouterClient } from "@repo/api/orpc/router";
import { getBaseUrl } from "@repo/utils";

const link = new RPCLink({
	url: `${getBaseUrl()}/api/rpc`,
	headers: async () => {
		if (typeof window !== "undefined") {
			return {};
		}

		const { headers } = await import("next/headers");
		return Object.fromEntries(await headers());
	},
	interceptors: [
		onError((error, context) => {
			// Skip abort errors (user cancelled requests)
			if (error instanceof Error && error.name === "AbortError") {
				return;
			}

			// Skip 401 Unauthorized errors for payments - these are expected
			if (error instanceof Error && 
				error.message === "Unauthorized" && 
				context?.path?.includes("payments")) {
				return;
			}

			// Skip empty errors or meaningless error objects
			if (!error || 
				error === null || 
				error === undefined ||
				(typeof error === 'object' && (
					Object.keys(error).length === 0 || 
					JSON.stringify(error) === '{}' ||
					JSON.stringify(error) === 'null' ||
					JSON.stringify(error) === 'undefined'
				))) {
				// Don't log empty errors - they're noise
				return;
			}

			// Skip certain known non-critical validation errors
			if (error instanceof Error && error.message?.includes("Input validation failed")) {
				console.warn("API validation error:", {
					path: context?.path,
					message: error.message,
				});
				return;
			}

			// Only log if error has meaningful content
			const hasError = error instanceof Error;
			const hasMessage = hasError && error.message && error.message.trim().length > 0;
			const hasPath = context?.path && context.path.length > 0;
			
			if (hasError && hasMessage && hasPath) {
				console.error("ORPC Error:", {
					path: context.path,
					message: error.message,
					code: (error as any).code || 'UNKNOWN',
					status: (error as any).status || 'N/A',
				});
			}
		}),
	],
});

export const orpcClient: ApiRouterClient = createORPCClient(link);
