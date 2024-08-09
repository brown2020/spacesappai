import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

type Props = { children: React.ReactNode; params: { id: string } };

export default function layout({ children, params: { id } }: Props) {
  auth().protect();
  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
