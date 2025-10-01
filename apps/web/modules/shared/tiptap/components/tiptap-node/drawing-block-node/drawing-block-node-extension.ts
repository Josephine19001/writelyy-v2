import { DrawingBlockNode as DrawingBlockNodeComponent } from "@shared/tiptap/components/tiptap-node/drawing-block-node/drawing-block-node";
import type { NodeType } from "@tiptap/pm/model";
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";

export interface DrawingBlockNodeOptions {
  type?: string | NodeType | undefined;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    drawingBlock: {
      setDrawingBlock: (options?: {
        width?: number;
        height?: number;
        drawingData?: string | null;
      }) => ReturnType;
    };
  }
}

/**
 * A Tiptap node extension that creates a drawing canvas component.
 */
export const DrawingBlockNode = Node.create<DrawingBlockNodeOptions>({
  name: "drawingBlock",

  group: "block",

  draggable: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      width: {
        default: 600,
        parseHTML: element => Number.parseInt(element.getAttribute("data-width") || "600", 10),
        renderHTML: attributes => ({
          "data-width": attributes.width.toString(),
        }),
      },
      height: {
        default: 400,
        parseHTML: element => Number.parseInt(element.getAttribute("data-height") || "400", 10),
        renderHTML: attributes => ({
          "data-height": attributes.height.toString(),
        }),
      },
      drawingData: {
        default: null,
        parseHTML: element => element.getAttribute("data-drawing-data"),
        renderHTML: attributes => ({
          "data-drawing-data": attributes.drawingData,
        }),
      },
      isDrawingMode: {
        default: false,
        parseHTML: element => element.getAttribute("data-drawing-mode") === "true",
        renderHTML: attributes => ({
          "data-drawing-mode": attributes.isDrawingMode ? "true" : "false",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="drawing-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        { "data-type": "drawing-block" },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DrawingBlockNodeComponent);
  },

  addCommands() {
    return {
      setDrawingBlock:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              width: options.width || 600,
              height: options.height || 400,
              drawingData: options.drawingData || null,
            },
          });
        },
    };
  },
});

export default DrawingBlockNode;