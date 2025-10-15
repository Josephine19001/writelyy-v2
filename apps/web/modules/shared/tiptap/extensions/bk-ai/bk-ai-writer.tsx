"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, useEditorState } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import * as React from "react";

export interface AiWriterOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiWriter: {
      setAiWriter: () => ReturnType;
    };
  }
}

// AI Writer View Component
function AiWriterView({ editor, node, getPos }: NodeViewProps) {
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  const { message, status, error } = useEditorState({
    editor: editor,
    selector: (instance) => {
      const storage = (instance.editor.storage as any).ai;
      return {
        status: storage?.status,
        message: storage?.message,
        error: storage?.error,
      };
    },
  });

  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, []);

  const insert = () => {
    if (!message) {
      return;
    }

    const from = getPos();
    if (from === undefined) {
      return;
    }
    const to = from + node.nodeSize;

    editor.chain().focus().insertContentAt({ from, to }, message).run();
  };

  const remove = () => {
    const from = getPos();
    if (from === undefined) {
      return;
    }
    const to = from + node.nodeSize;
    editor.chain().focus().deleteRange({ from, to }).run();
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <NodeViewWrapper>
      <div className="ai-writer flex flex-col py-4 px-5 rounded-md border bg-card shadow-sm select-none">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {!error && !!message && (
          <>
            <label className="mb-2 font-medium text-sm">Preview</label>
            <div className="max-h-80 overflow-auto mb-4 p-3 rounded-md bg-muted prose prose-sm dark:prose-invert max-w-full">
              <div dangerouslySetInnerHTML={{ __html: message }} />
            </div>
          </>
        )}

        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            const prompt = inputRef.current?.value;

            if (!prompt?.trim()) {
              return;
            }

            (editor.commands as any).bkAiTextPrompt?.({
              prompt: prompt,
              command: "prompt",
              insert: false,
            });
          }}
        >
          <label className="block mb-2 font-medium text-sm">Prompt</label>
          <textarea
            ref={inputRef}
            name="prompt"
            placeholder="Ask AI to write something... (e.g., Write a paragraph about sustainable energy)"
            className="w-full min-h-24 p-3 rounded-md border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <div className="flex items-center mt-4 gap-2">
            <Button
              type="button"
              data-style="ghost"
              disabled={isLoading}
              onClick={remove}
              className="text-destructive hover:text-destructive"
            >
              Remove
            </Button>
            <div className="flex-1" />
            {isSuccess && (
              <Button
                type="button"
                data-style="ghost"
                disabled={isLoading}
                onClick={insert}
              >
                ✓ Insert
              </Button>
            )}
            <Button type="submit" disabled={isLoading} data-style="primary">
              {isLoading ? "⏳ Generating..." : "✨ Generate"}
            </Button>
          </div>
        </form>
      </div>
    </NodeViewWrapper>
  );
}

export const BkAiWriter = Node.create<AiWriterOptions>({
  name: "aiWriter",
  group: "block",
  draggable: true,
  marks: "",

  addOptions() {
    return {
      apiUrl: "/api/completion",
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setAiWriter:
        () =>
        ({ editor, chain }) => {
          const $aiWriter = editor.$node(this.name);
          if ($aiWriter) {
            return false;
          }

          return chain()
            .aiReset()
            .insertContent({
              type: this.name,
            })
            .setMeta("preventUpdate", true)
            .run();
        },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiWriterView, {
      className: this.options.HTMLAttributes.class,
    });
  },
});
