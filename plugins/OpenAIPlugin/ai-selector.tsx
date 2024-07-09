import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ArrowUp } from "lucide-react";
import Markdown from "react-markdown";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { useCompletion } from "ai/react";
import { Wand, LoaderCircle } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, NodeKey, RangeSelection } from "lexical";
import { createDOMRange, createRectsFromDOMRange } from "@lexical/selection";
import './index.css';
import useOutsideClick from "../../hooks/useOutsideClick";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange, open }: AISelectorProps) {
  const [editor] = useLexicalComposerContext();
  const [inputValue, setInputValue] = React.useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useOutsideClick(boxRef, () => onOpenChange(false))

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        console.error("You have reached your request limit for the day.");
        return;
      }
    },
    onError: (e) => {
      console.error(e.message);
    },
  });

  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: [],
    }),
    [],
  );
  const selectionRef = useRef<RangeSelection | null>(null);

  const updateLocation = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset,
        );
        const boxElem = boxRef.current;
        if (range !== null && boxElem !== null) {
          const { left, bottom, width } = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft =
            selectionRects.length === 1 ? left + width / 2 - 175 : left - 175;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${bottom +
            + 20 +
            (window.pageYOffset || document.documentElement.scrollTop)
            }px`;
          const selectionRectsLength = selectionRects.length;
          const { container } = selectionState;
          const elements: Array<HTMLSpanElement> = selectionState.elements;
          const elementsLength = elements.length;

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i];
            let elem: HTMLSpanElement = elements[i];
            if (elem === undefined) {
              elem = document.createElement('span');
              elements[i] = elem;
              container.appendChild(elem);
            }
            const color = '255, 212, 0';
            const style = `position:absolute;top:${selectionRect.top +
              (window.pageYOffset || document.documentElement.scrollTop)
              }px;left:${selectionRect.left}px;height:${selectionRect.height
              }px;width:${selectionRect.width
              }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
            elem.style.cssText = style;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i];
            container.removeChild(elem);
            elements.pop();
          }
        }
      }
    });
  }, [editor, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener('resize', updateLocation);

    return () => {
      window.removeEventListener('resize', updateLocation);
    };
  }, [updateLocation]);

  const hasCompletion = completion.length > 0;

  return (
    <div
      ref={boxRef}
      id="ai-selector"
      className={`OpenAIPlugin_OpenAIInputBox w-[350px]`}
    >
      <div className="bg-gray-900 text-gray-200 rounded-md shadow-md p-4">
        {hasCompletion && (
          <div className="flex max-h-[400px] overflow-auto bg-gray-800 rounded-md">
            <div className="prose-inverse p-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-purple-400">
            <Wand className="mr-2 h-4 w-4 shrink-0" />
            AI is thinking
            <div className="ml-2 mt-1">
              <LoaderCircle className="animate-spin" />
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="relative mt-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
                className="w-full px-4 py-2 border rounded-md bg-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-700 flex items-center justify-center"
                onClick={() => {
                  if (completion) {
                    complete(completion, {
                      body: { option: "zap", command: inputValue },
                    }).then(() => setInputValue(""));
                    return;
                  }

                  editor.getEditorState().read(() => {
                    const selection = $getSelection();
                    const text = selection.getTextContent();
                    complete(text, {
                      body: { option: "zap", command: inputValue },
                    }).then(() => setInputValue(""));
                  });
                }}
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </button>
            </div>
            {hasCompletion ? (
              <AICompletionCommands
                onDiscard={() => {
                  onOpenChange(false);
                }}
                completion={completion}
              />
            ) : (
              <AISelectorCommands onSelect={(value, option) => complete(value, { body: { option } })} />
            )}
          </>
        )}
      </div>
    </div>

  );
}
