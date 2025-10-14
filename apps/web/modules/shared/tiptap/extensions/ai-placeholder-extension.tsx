import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, useEditorState } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import * as React from "react";

export interface AiPlaceholderOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiPlaceholder: {
      setAiPlaceholder: (props: { from: number; to: number }) => ReturnType;
    };
  }
}

// Spinner component
function BounceSpinner({ className }: { className?: string }) {
  return (
    <div className={`inline-flex gap-1 ${className || ""}`}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .bounce-dot {
          width: 4px;
          height: 4px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .bounce-dot:nth-child(1) { animation-delay: -0.32s; }
        .bounce-dot:nth-child(2) { animation-delay: -0.16s; }
      `}</style>
      <div className="bounce-dot" />
      <div className="bounce-dot" />
      <div className="bounce-dot" />
    </div>
  );
}

// AI Placeholder View
function AiPlaceholderView({ editor }: NodeViewProps) {
  const { completion } = useEditorState({
    editor: editor,
    selector: (instance) => {
      const storage = instance.editor.storage.customAi;
      return {
        completion: storage?.message || "",
      };
    },
  });

  return (
    <NodeViewWrapper>
      <span className="inline-flex items-baseline gap-2 text-gray-600">
        <span>{completion}</span>
        <BounceSpinner />
      </span>
    </NodeViewWrapper>
  );
}

export const AiPlaceholder = Node.create<AiPlaceholderOptions>({
  name: "aiPlaceholder",
  inline: true,
  group: "inline",
  atom: true,
  selectable: false,
  marks: "_",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setAiPlaceholder:
        ({ from, to }) =>
        ({ chain }) => {
          return chain()
            .focus()
            .command(({ commands }) => {
              commands.toggleNode("paragraph", "paragraph");
              return true;
            })
            .scrollIntoView()
            .insertContentAt(
              { from, to },
              {
                type: this.name,
              }
            )
            .setMeta("preventUpdate", true)
            .run();
        },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiPlaceholderView, {
      className: this.options.HTMLAttributes.class,
    });
  },
});
