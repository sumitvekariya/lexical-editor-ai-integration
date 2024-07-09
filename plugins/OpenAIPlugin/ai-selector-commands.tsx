import React from "react";
import { ArrowDownWideNarrow, CheckCheck, RefreshCcwDot, StepForward, WrapText } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection } from "lexical";

const options = [
  { value: "improve", label: "Improve writing", icon: RefreshCcwDot },
  { value: "fix", label: "Fix grammar", icon: CheckCheck },
  { value: "shorter", label: "Make shorter", icon: ArrowDownWideNarrow },
  { value: "longer", label: "Make longer", icon: WrapText },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const [editor] = useLexicalComposerContext();

  return (
    <>
      <div className="command-group bg-gray-800 text-gray-200 rounded-md shadow-md">
        <h3 className="command-group-heading text-lg font-semibold px-4 py-2">Edit or review selection</h3>
        <ul className="command-list">
          {options.map((option) => (
            <li
              key={option.value}
              className="command-item flex gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-md"
              onClick={() => {
                editor.getEditorState().read(() => {
                  const selection = $getSelection();
                  const text = selection.getTextContent();
                  onSelect(text, option.value);
                });
              }}
            >
              <option.icon className="h-4 w-4 self-center text-purple-400" />
              {option.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="command-separator my-2 border-t border-gray-600"></div>

      <div className="command-group bg-gray-800 text-gray-200 rounded-md shadow-md">
        <h3 className="command-group-heading text-lg font-semibold px-4 py-2">Use AI to do more</h3>
        <ul className="command-list">
          <li
            className="command-item flex gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-md"
            onClick={() => {
              editor.getEditorState().read(() => {
                const text = $getSelection().getTextContent();
                onSelect(text, "continue");
              });
            }}
          >
            <StepForward className="h-4 w-4 self-center text-purple-400" />
            Continue writing
          </li>
        </ul>
      </div>
    </>
  );
};

export default AISelectorCommands;
