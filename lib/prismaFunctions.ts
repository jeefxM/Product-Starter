"use server";
import { PrismaClient } from "@prisma/client";

import prisma from "./prisma";

export async function createUser(userData: {
  address: string;
  fid: string;
  username?: string;
  pfpUrl?: string;
}): Promise<any> {
  try {
    return await await prisma.user.create({
      data: {
        fid: "1234567890",
        pfpUrl: "https://via.placeholder.com/150",
        addresses: ["0x1234567890123456789012345678901234567890"],
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function checkUserExistsByFid(
  fid: string | null | undefined
): Promise<any | null> {
  // Validate input
  if (!fid) {
    console.log("No FID provided to checkUserExistsByFid");
    return null; // Return null instead of throwing an error
  }

  try {
    return await prisma.user.findUnique({
      where: {
        fid: fid,
      },
    });
  } catch (error) {
    console.error("Error checking user by FID:", error);
    // Consider not re-throwing the error if it would crash your app
    // Instead, return null and handle this case gracefully
    return null;
  }
}
