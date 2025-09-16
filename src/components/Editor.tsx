"use client";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";
import ChatToDocument from "./ChatToDocument";

type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
  onReady?: () => void;
  userName?: string;
  userEmail?: string;
};
function BlockNote({
  doc,
  provider,
  darkMode,
  onReady,
  userName,
  userEmail,
}: EditorProps) {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  const hasSignaledReadyRef = useRef(false);

  useEffect(() => {
    const createdEditor = BlockNoteEditor.create({
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userName || "Anonymous",
          color: stringToColor(userEmail || "1"),
        },
      },
    });
    setEditor(createdEditor);

    // Signal readiness once after creating the editor
    if (!hasSignaledReadyRef.current) {
      hasSignaledReadyRef.current = true;
      onReady?.();
    }

    // Cleanup on dependency change
    return () => {
      setEditor(null);
    };
  }, [doc, provider, userName, userEmail, onReady]);

  return (
    <div className="relative max-w-6xl mx-auto">
      {editor && (
        <BlockNoteView
          className="min-h-screen"
          editor={editor}
          theme={darkMode ? "dark" : "light"}
        />
      )}
    </div>
  );
}

export default function Editor({ onReady }: { onReady?: () => void }) {
  const room = useRoom();
  const userInfo = useSelf((me) => me.info);
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!room) return;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-100"
  }`;

  if (!doc || !provider || !isMounted) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        {/* translate */}

        <TranslateDocument doc={doc} />
        {/* chat to doc */}

        <ChatToDocument doc={doc} />
        {/* dark mode */}
        <Button className={style} onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

      {/* block note */}
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
