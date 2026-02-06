"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useTheme } from "next-themes";
import { useLatest } from "@/hooks";
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
  onReady?: () => void;
  userName?: string;
  userEmail?: string;
}

function BlockNote({
  doc,
  provider,
  darkMode,
  onReady,
  userName,
  userEmail,
}: BlockNoteProps) {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const hasSignaledReadyRef = useRef(false);
  // Track if provider is being destroyed to prevent editor operations
  const isDestroyedRef = useRef(false);
  // Track timeout for cleanup to prevent memory leaks
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use useLatest to keep refs updated without causing re-renders or effect re-runs
  const onReadyRef = useLatest(onReady);
  const userNameRef = useLatest(userName);
  const userEmailRef = useLatest(userEmail);

  // Create editor only when doc/provider change (not on user info changes)
  // Note: We include userName and userEmail to ensure editor has latest values
  // when created, but we use refs to avoid recreating on every user info change
  useEffect(() => {
    // Reset flags when doc/provider change
    hasSignaledReadyRef.current = false;
    isDestroyedRef.current = false;

    // Create editor instance with current user info
    // Using props directly on first render, refs on subsequent
    const createdEditor = BlockNoteEditor.create({
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

    setEditor(createdEditor);

    // Signal readiness once after creating the editor
    if (!hasSignaledReadyRef.current && onReadyRef.current) {
      hasSignaledReadyRef.current = true;
      // Use setTimeout to avoid calling during render
      readyTimeoutRef.current = setTimeout(() => {
        // Only signal if not destroyed
        if (!isDestroyedRef.current) {
          onReadyRef.current?.();
        }
        readyTimeoutRef.current = null;
      }, 0);
    }

    // Cleanup: mark as destroyed, clear timeout, and clear editor reference
    return () => {
      isDestroyedRef.current = true;
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
      setEditor(null);
      // Note: BlockNoteEditor doesn't have a destroy method
      // The collaboration provider cleanup is handled in parent
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, provider]); // Only depend on doc and provider - user info is accessed via props/refs

  // Don't render if destroyed or no editor
  if (isDestroyedRef.current || !editor) return null;

  return (
    <div className="relative max-w-6xl mx-auto">
      <BlockNoteView
        className="min-h-screen"
        editor={editor}
        theme={darkMode ? "dark" : "light"}
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

  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";

  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Stable callback reference
  const handleToggleDarkMode = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  // Initialize Yjs document and Liveblocks provider
  useEffect(() => {
    if (!room) return;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      // Proper cleanup order: provider first, then doc
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  // Track client-side mount for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted and initialized
  if (!doc || !provider || !isMounted) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <EditorToolbar
        doc={doc}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <BlockNote
        doc={doc}
        provider={provider}
        darkMode={darkMode}
        onReady={onReady}
        userName={userInfo?.name}
        userEmail={userInfo?.email}
      />
    </div>
  );
}
