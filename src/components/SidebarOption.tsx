"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import { cn } from "@/lib/utils";

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
    <div className="h-10 bg-gray-300 animate-pulse rounded-md" />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SidebarOption({ href, id }: SidebarOptionProps) {
  const pathname = usePathname();
  const [data, loading] = useDocumentData(doc(db, COLLECTIONS.DOCUMENTS, id));

  const isActive = pathname === href;

  if (loading) {
    return <SidebarOptionSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        "block p-2.5 rounded-md border transition-all duration-200",
        "hover:border-gray-500 hover:shadow-sm",
        isActive
          ? "bg-white border-gray-800 font-medium shadow-sm"
          : "bg-gray-100 border-gray-300"
      )}
    >
      <p className="truncate text-sm">{data.title || "Untitled"}</p>
    </Link>
  );
}
