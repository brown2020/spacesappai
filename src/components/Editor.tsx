"use client";

import { useEffect, useRef, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { withCollaboration } from "@blocknote/core/yjs";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useTheme } from "next-themes";
import { useLatest, useOwner } from "@/hooks";
import { readAiDocumentText } from "@/lib/document-utils";
import { generateAnswer, generateSummary } from "@/lib/generateActions";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";
import ChatToDocument from "./ChatToDocument";

// Server actions are imported in this static client module and passed in.
// A client-only dynamic import does not register them, so the click never
// starts a request.

// ============================================================================
// BLOCKNOTE EDITOR COMPONENT
// ============================================================================

interface BlockNoteProps {
  editor: BlockNoteEditor;
  darkMode: boolean;
  editable: boolean;
  onReady?: () => void;
}

function BlockNote({
  editor,
  darkMode,
  editable,
  onReady,
}: BlockNoteProps) {
  const hasSignaledReadyRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onReadyRef = useLatest(onReady);

  useEffect(() => {
    hasSignaledReadyRef.current = false;
    isDestroyedRef.current = false;

    if (!hasSignaledReadyRef.current && onReadyRef.current) {
      hasSignaledReadyRef.current = true;
      readyTimeoutRef.current = setTimeout(() => {
        if (!isDestroyedRef.current) {
          onReadyRef.current?.();
        }
        readyTimeoutRef.current = null;
      }, 0);
    }

    return () => {
      isDestroyedRef.current = true;
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    };
  }, [editor, onReadyRef]);

  if (!editor) return null;

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView
        className="min-h-screen"
        editor={editor}
        theme={darkMode ? "dark" : "light"}
        editable={editable}
      />
    </div>
  );
}

// ============================================================================
// EDITOR TOOLBAR
// ============================================================================

interface EditorToolbarProps {
  doc: Y.Doc;
  roomId: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  readDocument: () => string | null;
}

function EditorToolbar({
  doc,
  roomId,
  darkMode,
  onToggleDarkMode,
  readDocument,
}: EditorToolbarProps) {
  const buttonStyles = darkMode
    ? "text-muted-foreground bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
    : "text-muted-foreground bg-muted hover:bg-accent hover:text-accent-foreground transition-colors";

  return (
    <div className="flex items-center gap-2 justify-end mb-10">
      <TranslateDocument
        doc={doc}
        roomId={roomId}
        readDocument={readDocument}
        generateSummary={generateSummary}
      />
      <ChatToDocument
        doc={doc}
        roomId={roomId}
        readDocument={readDocument}
        generateAnswer={generateAnswer}
      />

      <Button
        className={buttonStyles}
        onClick={onToggleDarkMode}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN EDITOR COMPONENT
// ============================================================================

interface EditorProps {
  onReady?: () => void;
}

export default function Editor({ onReady }: EditorProps) {
  const room = useRoom();
  const userInfo = useSelf((me) => me.info);
  const { canEdit } = useOwner();

  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleToggleDarkMode = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  if (!isMounted || !room) {
    return null;
  }

  return (
    <EditorSession
      key={room.id}
      room={room}
      canEdit={canEdit}
      darkMode={darkMode}
      onToggleDarkMode={handleToggleDarkMode}
      onReady={onReady}
      userName={userInfo?.name}
      userEmail={userInfo?.email}
    />
  );
}

interface EditorSessionProps {
  room: NonNullable<ReturnType<typeof useRoom>>;
  canEdit: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onReady?: () => void;
  userName?: string;
  userEmail?: string;
}

function EditorSession({
  room,
  canEdit,
  darkMode,
  onToggleDarkMode,
  onReady,
  userName,
  userEmail,
}: EditorSessionProps) {
  const [collab] = useState(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    return { doc: yDoc, provider: yProvider };
  });

  useEffect(() => {
    return () => {
      collab.provider.destroy();
      collab.doc.destroy();
    };
  }, [collab]);

  const { doc, provider } = collab;

  // withCollaboration disables ProseMirror history so y-prosemirror owns the
  // document. Liveblocks syncs a yjs v13 doc; @blocknote/core/yjs matches it.
  // @blocknote/core/y expects an @y/y v14 node and throws on this fragment.
  const editor = useMemo(() => {
    return BlockNoteEditor.create(
      withCollaboration({
        collaboration: {
          fragment: doc.getXmlFragment("document-store"),
          user: {
            name: userName || "Anonymous",
            color: stringToColor(userEmail || "anonymous"),
          },
          provider: {
            // Liveblocks awareness implements the methods the cursor plugin calls.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            awareness: provider.awareness as any,
          },
        },
      })
    );
  }, [doc, provider, userName, userEmail]);

  const readDocument = useCallback(
    () => readAiDocumentText(doc, editor),
    [doc, editor]
  );

  return (
    <div className="max-w-6xl mx-auto">
      {canEdit && (
      <EditorToolbar
        doc={doc}
        roomId={room.id}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        readDocument={readDocument}
      />
      )}

      <BlockNote
        editor={editor}
        darkMode={darkMode}
        editable={canEdit}
        onReady={onReady}
      />
    </div>
  );
}
