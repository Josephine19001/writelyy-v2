"use client";

// -- Hooks --
import { useIsomorphicLayoutEffect } from "@shared/tiptap/hooks/use-isomorphic-layout-effect";
import * as React from "react";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import ReactTextareaAutosize from "react-textarea-autosize";

export function TextareaAutosize({ ...props }: TextareaAutosizeProps) {
	const [isRerendered, setIsRerendered] = React.useState(false);

	useIsomorphicLayoutEffect(() => setIsRerendered(true), []);

	return isRerendered ? <ReactTextareaAutosize {...props} /> : null;
}

TextareaAutosize.displayName = "TextareaAutosize";
