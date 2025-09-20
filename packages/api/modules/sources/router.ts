import { createSource } from "./procedures/create-source";
import { deleteSource } from "./procedures/delete-source";
import { findSource } from "./procedures/find-source";
import { linkToDocument } from "./procedures/link-to-document";
import { listSources } from "./procedures/list-sources";

export const sourcesRouter = {
	list: listSources,
	find: findSource,
	create: createSource,
	delete: deleteSource,
	linkToDocument,
};