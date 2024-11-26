// import RoomProvider from "@/components/RoomProvider";
// import { auth } from "@clerk/nextjs/server";

// type Props = { children: React.ReactNode; params: { id: string } };

// export default async function layout({ children, params: { id } }: Props) {
//   await auth.protect();
//   return <RoomProvider roomId={id}>{children}</RoomProvider>;
// }

import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export default async function layout({ children, params }: Props) {
  const resolvedParams = await params; // Resolve the async params
  const { id } = resolvedParams;

  await auth.protect(); // Ensure auth is checked before rendering

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
