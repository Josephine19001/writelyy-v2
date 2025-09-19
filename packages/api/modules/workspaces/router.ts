import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateWorkspaceSlug } from "./procedures/generate-workspace-slug";

export const workspacesRouter = {
	generateSlug: generateWorkspaceSlug,
	createLogoUploadUrl,
};
