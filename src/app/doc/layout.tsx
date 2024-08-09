import LiveBlocksProvider from "@/components/LiveBlocksProvider";

type Props = { children: React.ReactNode };
export default function layout({ children }: Props) {
  return <LiveBlocksProvider>{children}</LiveBlocksProvider>;
}
