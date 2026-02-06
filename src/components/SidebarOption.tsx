"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";
import PageIcon from "./PageIcon";

// ============================================================================
// TYPES
// ============================================================================

interface SidebarOptionProps {
  href: string;
  id: string;
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function SidebarOptionSkeleton() {
  return (
    <div className="h-10 bg-muted-foreground/20 animate-pulse rounded-md" />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SidebarOption({ href, id }: SidebarOptionProps) {
  const pathname = usePathname();
  const docRef = useMemo(
    () => doc(db, COLLECTIONS.DOCUMENTS, id),
    [id]
  );
  const [data, loading, error] = useDocumentData(docRef);

  const isActive = pathname === href;

  if (loading) {
    return <SidebarOptionSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-md border transition-all duration-200",
        "hover:border-border hover:shadow-sm",
        isActive
          ? "bg-background border-foreground font-medium shadow-sm"
          : "bg-secondary border-border"
      )}
    >
      <PageIcon icon={data.icon} size="sm" />
      <p className="truncate text-sm flex-1">{data.title || "Untitled"}</p>
    </Link>
  );
}
