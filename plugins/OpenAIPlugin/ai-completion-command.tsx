import React from "react";
import { Check, TextQuote, TrashIcon } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { marked } from 'marked';
import { $generateNodesFromDOM } from '@lexical/html';

const AICompletionCommands = ({ completion, onDiscard }) => {
  const [editor] = useLexicalComposerContext();

  return (
    <>
      <div className="command-group bg-gray-800 text-gray-200 rounded-md shadow-md">
        <ul className="command-list">
          <li
            className="command-item flex gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-md"
            onClick={() => {
              editor.update(async () => {
                const selection = $getSelection();
                const htmlContent = marked.parse(completion);
                const domParser = new DOMParser();
                const nodes = $generateNodesFromDOM(editor, domParser.parseFromString(htmlContent as string, "text/html"));
                selection.insertNodes(nodes);
                onDiscard();
              });
            }}
          >
            <Check className="h-4 w-4 self-center text-green-400" />
            Replace selection
          </li>
          <li
            className="command-item flex gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-md"
            onClick={() => {
              editor.update(async () => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  const htmlContent = marked.parse(completion);
                  const domParser = new DOMParser();
                  const nodes = $generateNodesFromDOM(editor, domParser.parseFromString(htmlContent as string, "text/html"));
                  selection.insertNodes([...selection.getNodes(), ...nodes]);
                }
                onDiscard();
              }, { discrete: true });
            }}
          >
            <TextQuote className="h-4 w-4 self-center text-blue-400" />
            Insert below
          </li>
        </ul>
      </div>

      <div className="command-separator my-2 border-t border-gray-600"></div>

      <div className="command-group bg-gray-800 text-gray-200 rounded-md shadow-md">
        <ul className="command-list">
          <li
            className="command-item flex gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-md"
            onClick={onDiscard}
          >
            <TrashIcon className="h-4 w-4 self-center text-red-400" />
            Discard
          </li>
        </ul>
      </div>
    </>
  );
};

export default AICompletionCommands;
