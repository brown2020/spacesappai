"use client";

import { motion } from "framer-motion";
import stringToColor from "@/lib/stringToColor";

// ============================================================================
// TYPES
// ============================================================================

interface FollowPointerProps {
  info: {
    name?: string;
    email: string;
  };
  x: number;
  y: number;
}

// ============================================================================
// CURSOR SVG
// ============================================================================

interface CursorIconProps {
  color: string;
}

function CursorIcon({ color }: CursorIconProps) {
  return (
    <svg
      stroke={color}
      fill={color}
      strokeWidth="1"
      viewBox="0 0 16 16"
      className="h-6 w-6 -rotate-[70deg] -translate-x-3 -translate-y-2.5"
    >
      <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
    </svg>
  );
}

// ============================================================================
// NAME TAG
// ============================================================================

interface NameTagProps {
  name: string;
  color: string;
}

function NameTag({ name, color }: NameTagProps) {
  return (
    <motion.div
      style={{ backgroundColor: color }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className="px-2 py-1 text-white text-xs font-medium rounded-full whitespace-nowrap shadow-lg"
    >
      {name}
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FollowPointer({
  info: { name, email },
  x,
  y,
}: FollowPointerProps) {
  const color = stringToColor(email);
  const displayName = name || email;

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{ top: y, left: x }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <CursorIcon color={color} />
      <NameTag name={displayName} color={color} />
    </motion.div>
  );
}
