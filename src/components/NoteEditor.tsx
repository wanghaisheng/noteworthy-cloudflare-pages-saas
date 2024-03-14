'use client';

import { EditorProvider, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorMenuBar from './EditorMenuBar';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { ReactNode } from 'react';

interface NoteEditorProps {
  content: string;
  children: ReactNode;
}

export default function NoteEditor({ content, children }: NoteEditorProps) {
  const extensions = [
    StarterKit,
    Underline,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Extension.create({
      addKeyboardShortcuts() {
        return {
          Tab: () =>
            this.editor
              .chain()
              .command(({ tr }) => {
                tr.insertText('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0');
                return true;
              })
              .run(),
        };
      },
    }),
  ];
  const editorProps = {
    attributes: {
      class:
        'prose prose-neutral px-14 pb-12 h-[70vh] prose-invert prose-p:m-0 focus:outline-none scrollbar-thin scrollbar-thumb-silver scrollbar-track-black selection:bg-night selection:text-neutral-200',
    },
  };
  return (
    <>
      <EditorProvider
        content={content}
        slotBefore={
          <>
            {children}
            <EditorMenuBar />
          </>
        }
        extensions={extensions}
        editorProps={editorProps}
      >
        <></>
      </EditorProvider>
    </>
  );
}
