// "use client";

// import Document from "@/components/Document";

// type Props = {
//   params: {
//     id: string;
//   };
// };
// export default function documentPage({ params: { id } }: Props) {
//   return (
//     <div className="flex flex-col flex-1 min-h-screen">
//       <Document id={id} />
//     </div>
//   );
// }

// "use client";

import Document from "@/components/Document";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function documentPage({ params }: Props) {
  const resolvedParams = await params; // Resolve the async params
  const { id } = resolvedParams;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}
