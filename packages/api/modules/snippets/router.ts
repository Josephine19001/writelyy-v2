import { createSnippet } from "./procedures/create-snippet";
import { deleteSnippet } from "./procedures/delete-snippet";
import { findSnippet } from "./procedures/find-snippet";
import { linkToDocument } from "./procedures/link-to-document";
import { listSnippets } from "./procedures/list-snippets";
import { updateSnippet } from "./procedures/update-snippet";

export const snippetsRouter = {
	list: listSnippets,
	find: findSnippet,
	create: createSnippet,
	update: updateSnippet,
	delete: deleteSnippet,
	linkToDocument,
};