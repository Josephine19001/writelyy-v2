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

// Bounce Spinner Component
function BounceSpinner({ className }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 items-center ${className || ""}`}>
      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .bounce-dot {
          width: 4px;
          height: 4px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          animation: bounce-dot 1.4s infinite ease-in-out both;
        }
        .bounce-dot:nth-child(1) { animation-delay: -0.32s; }
        .bounce-dot:nth-child(2) { animation-delay: -0.16s; }
        .bounce-dot:nth-child(3) { animation-delay: 0s; }
      `}</style>
      <span className="bounce-dot" />
      <span className="bounce-dot" />
      <span className="bounce-dot" />
    </span>
  );
}

// AI Placeholder View Component
function AiPlaceholderView({ editor }: NodeViewProps) {
  const { completion } = useEditorState({
    editor: editor,
    selector: (instance) => {
      const storage = (instance.editor.storage as any).ai;
      return {
        completion: storage?.message || "",
      };
    },
  });

  return (
    <NodeViewWrapper>
      <span className="inline-flex items-baseline gap-2 text-muted-foreground opacity-70">
        <span>{completion}</span>
        <BounceSpinner />
      </span>
    </NodeViewWrapper>
  );
}

export const BkAiPlaceholder = Node.create<AiPlaceholderOptions>({
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
