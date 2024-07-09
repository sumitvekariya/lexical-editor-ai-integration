import React, { Fragment, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AISelector } from "./ai-selector";
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { createPortal } from "react-dom";

export const OPEN_AI_COMMAND: LexicalCommand<void> = createCommand(
  'OPEN_AI_COMMAND',
);

export const OpenAIPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        OPEN_AI_COMMAND,
        () => {
          const domSelection = window.getSelection();
          if (domSelection !== null) {
            domSelection.removeAllRanges();
          }


          setOpen(true);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor]);

  return (
    <>
      {open && createPortal(<AISelector open={open} onOpenChange={setOpen}/>, document.body)}
    </>
  );
};