"use client";

import { useEffect, useRef, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useTheme } from "next-themes";
import { useLatest, useOwner } from "@/hooks";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import stringToColor from "@/lib/stringToColor";

// Dynamic imports for code splitting - AI features are not needed until user clicks
const TranslateDocument = dynamic(() => import("./TranslateDocument"), {
  ssr: false,
});
const ChatToDocument = dynamic(() => import("./ChatToDocument"), {
  ssr: false,
});

// ============================================================================
// BLOCKNOTE EDITOR COMPONENT
// ============================================================================

interface BlockNoteProps {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
  editable: boolean;
  onReady?: () => void;
  userName?: string;
  userEmail?: string;
}

function BlockNote({
  doc,
  provider,
  darkMode,
  editable,
  onReady,
  userName,
  userEmail,
}: BlockNoteProps) {
  const hasSignaledReadyRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onReadyRef = useLatest(onReady);
  const userNameRef = useLatest(userName);
  const userEmailRef = useLatest(userEmail);

  // Create editor during render (memoized) to avoid cascading setState in effects
  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      collaboration: {
        // @ts-expect-error BlockNote expects y-protocols/awareness Awareness type,
        // but Liveblocks bundles a compatible but structurally different Awareness type.
        provider: provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userName || userNameRef.current || "Anonymous",
          color: stringToColor(
            userEmail || userEmailRef.current || "anonymous"
          ),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, provider]);

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
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

function EditorToolbar({
  doc,
  darkMode,
  onToggleDarkMode,
}: EditorToolbarProps) {
  const buttonStyles = darkMode
    ? "text-muted-foreground bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
    : "text-muted-foreground bg-muted hover:bg-accent hover:text-accent-foreground transition-colors";

  return (
    <div className="flex items-center gap-2 justify-end mb-10">
      <TranslateDocument doc={doc} />
      <ChatToDocument doc={doc} />

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

  return (
    <div className="max-w-6xl mx-auto">
      {canEdit && (
        <EditorToolbar
          doc={doc}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
      )}

      <BlockNote
        doc={doc}
        provider={provider}
        darkMode={darkMode}
        editable={canEdit}
        onReady={onReady}
        userName={userName}
        userEmail={userEmail}
      />
    </div>
  );
}
