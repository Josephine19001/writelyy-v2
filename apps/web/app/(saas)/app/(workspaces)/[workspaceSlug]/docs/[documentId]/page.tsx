import { getActiveWorkspace } from "@saas/auth/lib/server";
import { DocumentPage } from "@saas/shared/components/pages/DocumentPage";
import { WorkspaceCacheProvider } from "@saas/shared/components/providers/WorkspaceCacheProvider";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ workspaceSlug: string; documentId: string }>;
}) {
	const { workspaceSlug, documentId } = await params;

	const activeWorkspace = await getActiveWorkspace(workspaceSlug as string);

	if (!activeWorkspace) {
		return {
			title: "Document Not Found",
		};
	}

	// Use generic metadata to avoid server-side auth issues
	// Document title will be updated client-side via the editor
	return {
		title: `Document - ${activeWorkspace.name}`,
		description: `Edit document in ${activeWorkspace.name}`,
	};
}

export default async function DocumentPageRoute({
	params,
}: {
	params: Promise<{ workspaceSlug: string; documentId: string }>;
}) {
	const { workspaceSlug, documentId } = await params;

	const activeWorkspace = await getActiveWorkspace(workspaceSlug as string);

	if (!activeWorkspace) {
		return notFound();
	}

	// Note: Document validation is handled client-side via useDocumentRouter
	// Server-side validation can cause auth issues, so we let the client handle it

	// Return the document page wrapped with necessary providers
	// Note: documentId is accessed via useDocumentRouter hook inside DocumentPage
	return (
		<WorkspaceCacheProvider>
			<DocumentPage 
				showSidebar={true} 
				showBreadcrumbs={true} 
				compactBreadcrumbs={false}
			/>
		</WorkspaceCacheProvider>
	);
}