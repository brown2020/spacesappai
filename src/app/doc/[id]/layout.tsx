import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

type Props = { children: React.ReactNode; params: { id: string } };

export default async function layout({ children, params: { id } }: Props) {
  await auth.protect();
  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
