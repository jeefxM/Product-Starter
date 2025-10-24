"use server";

import prisma from "@/lib/prisma";

type RegisterUserInput = {
  fid?: number | string | null;
  walletAddress?: string | null;
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
};

function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function registerUser(input: RegisterUserInput) {
  const { fid, walletAddress, name, username, avatar } = input;

  console.log("[registerUser] input", {
    fid,
    walletAddress,
    name,
    username,
    avatar,
  });

  if (walletAddress && !isValidEthAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const fidString =
    fid !== undefined && fid !== null && String(fid).trim() !== ""
      ? String(fid).trim()
      : null;

  try {
    const normalized = walletAddress ? walletAddress.toLowerCase() : null;
    const displayName = name ?? username ?? null;
    console.log("[registerUser] strategy", {
      fidString,
      normalized,
      displayName,
      avatar,
    });

    if (normalized) {
      const user = await prisma.user.upsert({
        where: { walletAddress: normalized },
        update: {
          fid: fidString ?? undefined,
          name: displayName ?? undefined,
          avatar: avatar ?? undefined,
          walletAddress: normalized,
        },
        create: {
          fid: fidString ?? undefined,
          name: displayName ?? undefined,
          avatar: avatar ?? undefined,
          walletAddress: normalized,
        },
      });
      console.log("[registerUser] success (by address)", { id: user.id });
      return user;
    }

    if (fidString != null) {
      const updated = await prisma.user.updateMany({
        where: { fid: fidString },
        data: {
          name: displayName ?? undefined,
          avatar: avatar ?? undefined,
        },
      });
      if (updated.count > 0) {
        const user = await prisma.user.findFirst({
          where: { fid: fidString },
          orderBy: { createdAt: "desc" },
        });
        if (user) {
          console.log("[registerUser] success (update by fid)", {
            id: user.id,
          });
          return user;
        }
      }
      const user = await prisma.user.create({
        data: {
          fid: fidString,
          name: displayName ?? undefined,
          avatar: avatar ?? undefined,
        },
      });
      console.log("[registerUser] success (create by fid)", { id: user.id });
      return user;
    }

    throw new Error("Missing fid and walletAddress; nothing to register");
  } catch (e) {
    console.error("[registerUser] prisma error", e);
    throw e;
  }
}
