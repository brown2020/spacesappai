"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ============================================================================
// TYPES
// ============================================================================

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Build breadcrumb segments from pathname
 */
function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1;

    // For "doc" segment, link to home
    const href =
      segment === "doc" ? "/" : `/${segments.slice(0, index + 1).join("/")}`;

    // Capitalize first letter for display
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { label, href, isLast };
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(pathname),
    [pathname]
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic segments */}
        {breadcrumbs.map((segment) => (
          <Fragment key={segment.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {segment.isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={segment.href}>{segment.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
