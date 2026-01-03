import { NextResponse } from "next/server";
import { clientEnv, serverEnv } from "@/lib/env";

export async function GET() {
  return NextResponse.json(
    {
      client: {
        projectId: clientEnv.firebase.projectId,
        authDomain: clientEnv.firebase.authDomain,
        apiKeyPrefix: clientEnv.firebase.apiKey?.slice(0, 6) ?? null,
      },
      server: {
        projectId: serverEnv.firebase.projectId,
        clientEmail: serverEnv.firebase.clientEmail,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}




