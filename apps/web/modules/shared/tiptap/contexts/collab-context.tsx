"use client";

import * as React from "react";
import { WebsocketProvider } from "y-websocket";
import { Doc as YDoc } from "yjs";
import {
	fetchCollabToken,
	getUrlParam,
	TIPTAP_COLLAB_DOC_PREFIX,
	TIPTAP_COLLAB_APP_ID,
} from "../lib/tiptap-collab-utils";

export type CollabContextValue = {
	provider: WebsocketProvider | null;
	ydoc: YDoc;
	hasCollab: boolean;
};

export const CollabContext = React.createContext<CollabContextValue>({
	hasCollab: false,
	provider: null,
	ydoc: new YDoc(),
});

export const CollabConsumer = CollabContext.Consumer;
export const useCollab = (): CollabContextValue => {
	const context = React.useContext(CollabContext);
	if (!context) {
		throw new Error("useCollab must be used within an CollabProvider");
	}
	return context;
};

export const useCollaboration = (room: string) => {
	const [provider, setProvider] = React.useState<WebsocketProvider | null>(
		null,
	);
	const [hasCollab, setHasCollab] = React.useState<boolean>(true);
	const ydoc = React.useMemo(() => new YDoc(), []);

	React.useEffect(() => {
		const noCollabParam = getUrlParam("noCollab");
		setHasCollab(Number.parseInt(noCollabParam || "0") !== 1);
	}, []);

	React.useEffect(() => {
		if (!hasCollab) return;

		const docPrefix = TIPTAP_COLLAB_DOC_PREFIX;
		const documentName = room ? `${docPrefix}${room}` : docPrefix;

		// Use your own WebSocket server URL
		// For development, you might use ws://localhost:1234
		// For production, use your deployed WebSocket server
		const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";

		const newProvider = new WebsocketProvider(
			wsUrl,
			documentName,
			ydoc
		);

		setProvider(newProvider);

		return () => {
			newProvider.destroy();
		};
	}, [ydoc, room, hasCollab]);

	return { provider, ydoc, hasCollab };
};

export function CollabProvider({
	children,
	room,
}: Readonly<{
	children: React.ReactNode;
	room: string;
}>) {
	const { hasCollab, provider, ydoc } = useCollaboration(room);

	const value = React.useMemo<CollabContextValue>(
		() => ({
			hasCollab,
			provider,
			ydoc,
		}),
		[hasCollab, provider, ydoc],
	);

	return (
		<CollabContext.Provider value={value}>
			{children}
		</CollabContext.Provider>
	);
}
