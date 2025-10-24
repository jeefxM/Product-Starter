// app/api/register/route.ts
import { NextResponse } from "next/server";
import { registerUser } from "@/app/actions/registerUser";

export async function POST(req: Request) {
  try {
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.log("body", body);

    const { fid, walletAddress, name } = (body ?? {}) as {
      fid?: number | string | null;
      walletAddress?: string | "0x0000000000000000000000000000000000000000";
      name?: string | null;
    };

    const user = await registerUser({ fid, walletAddress, name });

    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      fid: user.fid,
      name: user.name,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    console.error("[/api/register] error", e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
