import { createDocument } from "./procedures/create-document";
import { deleteDocument } from "./procedures/delete-document";
import { findDocument } from "./procedures/find-document";
import { listDocuments } from "./procedures/list-documents";
import { updateDocument } from "./procedures/update-document";

export const documentsRouter = {
	list: listDocuments,
	find: findDocument,
	create: createDocument,
	update: updateDocument,
	delete: deleteDocument,
};