"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";
import ChatToDocument from "./ChatToDocument";

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
  const onReadyRef = useRef(onReady);

  // Keep onReady ref updated to avoid stale closures
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    // Create editor instance
    const createdEditor = BlockNoteEditor.create({
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userName || "Anonymous",
          color: stringToColor(userEmail || "anonymous"),
        },
      },
    });

    setEditor(createdEditor);

    // Signal readiness once after creating the editor
    if (!hasSignaledReadyRef.current && onReadyRef.current) {
      hasSignaledReadyRef.current = true;
      // Use setTimeout to avoid calling during render
      setTimeout(() => onReadyRef.current?.(), 0);
    }

    // Cleanup: properly destroy editor
    return () => {
      setEditor(null);
      // Note: BlockNoteEditor doesn't have a destroy method
      // The collaboration provider cleanup is handled in parent
    };
  }, [doc, provider, userName, userEmail]);

  if (!editor) return null;

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
  const buttonStyles = `
    hover:text-white transition-colors
    ${
      darkMode
        ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
        : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-100"
    }
  `;

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

  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Stable callback reference
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

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
