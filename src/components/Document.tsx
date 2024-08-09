"use client";

import { useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import Editor from "./Editor";
import useOwner from "@/lib/useOwner";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import Avatars from "./Avatars";
import { db } from "@/firebase/firebaseConfig";

type Props = { id: string };
export default function Document({ id }: Props) {
  const [data, loading, error] = useDocumentData(doc(db, "documents", id));
  const [input, setInput] = useState("");
  const [isUpdating, startTransition] = useTransition();
  const isOwner = useOwner();

  useEffect(() => {
    if (!data) return;
    setInput(data.title);
  }, [data]);

  const updateTitle = (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      startTransition(async () => {
        await updateDoc(doc(db, "documents", id), { title: input });
      });
    }
  };

  return (
    <div className="flex-1 h-full bg-white p-5">
      <div className="flex max-w-6xl mx-auto justify-between pb-5">
        <form className="flex flex-1 gap-2" onSubmit={updateTitle}>
          {/* update title */}
          <Input value={input} onChange={(e) => setInput(e.target.value)} />

          <Button disabled={isUpdating || !input.trim()}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>

          {/* If  */}

          {isOwner && (
            <>
              <InviteUser />
              <DeleteDocument />
            </>
          )}

          {/* isOwner && InviteUser, DeleteDocument */}
        </form>
      </div>
      <div className="flex max-w-6xl mx-auto justify-between items-center mb-5">
        <ManageUsers />
        <Avatars />
      </div>
      <hr className="pb-10" />

      <Editor />
    </div>
  );
}
