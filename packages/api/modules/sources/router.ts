import { createSource } from "./procedures/create-source";
import { deleteSource } from "./procedures/delete-source";
import { findSource } from "./procedures/find-source";
import { linkToDocument } from "./procedures/link-to-document";
import { listSources } from "./procedures/list-sources";
import { updateSource } from "./procedures/update-source";
import { updateProcessingStatus } from "./procedures/update-processing-status";
import { fixPendingSources } from "./procedures/fix-pending-sources";

export const sourcesRouter = {
	list: listSources,
	find: findSource,
	create: createSource,
	update: updateSource,
	delete: deleteSource,
	linkToDocument,
	updateProcessingStatus,
	fixPendingSources,
};