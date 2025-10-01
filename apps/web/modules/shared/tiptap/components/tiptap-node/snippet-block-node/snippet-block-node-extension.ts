import { SnippetBlockNode as SnippetBlockNodeComponent } from "@shared/tiptap/components/tiptap-node/snippet-block-node/snippet-block-node";
import type { NodeType } from "@tiptap/pm/model";
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";

export interface Snippet {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SnippetBlockNodeOptions {
  type?: string | NodeType | undefined;
  HTMLAttributes: Record<string, any>;
  snippets?: Snippet[];
  onSnippetSelect?: (snippet: Snippet) => void;
  onSnippetCreate?: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    snippetBlock: {
      setSnippetBlock: (options?: {
        snippetId?: string | null;
        placeholder?: string;
      }) => ReturnType;
    };
  }
}

/**
 * A Tiptap node extension that creates a snippet block component.
 */
export const SnippetBlockNode = Node.create<SnippetBlockNodeOptions>({
  name: "snippetBlock",

  group: "block",

  draggable: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      snippets: [],
      onSnippetSelect: undefined,
      onSnippetCreate: undefined,
    };
  },

  addAttributes() {
    return {
      snippetId: {
        default: null,
        parseHTML: element => element.getAttribute("data-snippet-id"),
        renderHTML: attributes => ({
          "data-snippet-id": attributes.snippetId,
        }),
      },
      placeholder: {
        default: "Select a snippet...",
        parseHTML: element => element.getAttribute("data-placeholder"),
        renderHTML: attributes => ({
          "data-placeholder": attributes.placeholder,
        }),
      },
      content: {
        default: "",
        parseHTML: element => element.getAttribute("data-content"),
        renderHTML: attributes => ({
          "data-content": attributes.content,
        }),
      },
      title: {
        default: "",
        parseHTML: element => element.getAttribute("data-title"),
        renderHTML: attributes => ({
          "data-title": attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="snippet-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        { "data-type": "snippet-block" },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SnippetBlockNodeComponent);
  },

  addCommands() {
    return {
      setSnippetBlock:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              snippetId: options.snippetId || null,
              placeholder: options.placeholder || "Select a snippet...",
              content: "",
              title: "",
            },
          });
        },
    };
  },
});

export default SnippetBlockNode;