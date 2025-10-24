// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useMiniKit } from "@coinbase/onchainkit/minikit";
// import { useAccount } from "wagmi";
// import { getBalance } from "@wagmi/core";

// // import { createUser } from "@/lib/prismaFunctions";// Adjust import path as needed
// import { createUser, checkUserExistsByFid } from "@/lib/prismaFunctions";

// // Define types for the SDK user context
// interface SDKUser {
//   fid?: number;
//   username?: string;
//   displayName?: string;
//   pfpUrl?: string;
// }

// // Define types for the authenticated user from DB
// interface DBUser {
//   id: string;
//   fid: string;
//   username?: string;
//   pfpUrl?: string;
//   // Add other database user properties as needed
// }

// // SDK Context Type
// type SDKContextType = {
//   user: SDKUser | null;
//   isSDKLoaded: boolean;
//   balance: bigint | null;
//   refetchContext: () => Promise<void>;
// };

// // Auth Context Type
// type AuthContextType = {
//   dbUser: DBUser | null;
//   isAuthLoading: boolean;
//   isAuthenticated: boolean;
//   error: Error | null;
// };

// // Create contexts
// const SDKContext = createContext<SDKContextType>({
//   user: null,
//   isSDKLoaded: false,
//   balance: null,
//   refetchContext: async () => {},
// });

// const AuthContext = createContext<AuthContextType>({
//   dbUser: null,
//   isAuthLoading: true,
//   isAuthenticated: false,
//   error: null,
// });

// // Custom hooks to use the contexts
// export const useSDK = () => useContext(SDKContext);
// export const useAuth = () => useContext(AuthContext);

// // SDK Context Provider - handles Farcaster SDK integration
// export const SDKContextProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<SDKUser | null>(null);
//   const [isSDKLoaded, setIsSDKLoaded] = useState<boolean>(false);
//   const [balance, setBalance] = useState<bigint | null>(null);
//   const { address } = useAccount();
//   const { setFrameReady, isFrameReady, context } = useMiniKit();

//   const loadSDKContext = async () => {
//     try {
//       console.log("SDK Context loaded:", context);
//       setUser(context?.user || null);
//       isFrameReady;

//       setIsSDKLoaded(true);
//     } catch (error) {
//       console.error("Error loading SDK context:", error);
//       setIsSDKLoaded(true);
//     }
//   };

//   // Initialize SDK context on mount or when address changes
//   useEffect(() => {
//     loadSDKContext();
//   }, [address]);

//   const refetchContext = async () => {
//     await loadSDKContext();
//   };

//   const value = {
//     user,
//     isSDKLoaded,
//     balance,
//     refetchContext,
//   };

//   return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
// };

// // Auth Provider - handles user registration and authentication
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { user, isSDKLoaded } = useSDK();
//   const [dbUser, setDbUser] = useState<DBUser | null>(null);
//   const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const { address } = useAccount();

//   // Check and register user when SDK is loaded and we have a user
//   useEffect(() => {
//     const checkAndRegisterUser = async () => {
//       if (!isSDKLoaded || !user?.fid) {
//         setIsAuthLoading(false);
//         return;
//       }

//       try {
//         setIsAuthLoading(true);
//         console.log(`Checking if user with FID ${user.fid} exists in database`);

//         // Check if user exists in the database
//         const existingUser = await checkUserExistsByFid(user.fid.toString());

//         if (existingUser) {
//           // User exists, set the authenticated user
//           console.log(`User found in database: ${existingUser.id}`);
//           setDbUser(existingUser);
//         } else if (address) {
//           // User doesn't exist, create them
//           console.log(`User not found, creating new user with FID ${user.fid}`);
//           console.log(address, user, "user");
//           const newUser = await createUser({
//             address: address,
//             fid: user.fid.toString(),
//             username: user.username,
//             pfpUrl: user.pfpUrl || "",
//           });
//           // await sdk.actions.addFrame();

//           console.log(`New user created with ID: ${newUser.id}`);
//           setDbUser(newUser);
//         }

//         setIsAuthLoading(false);
//       } catch (err) {
//         console.error("Error checking/registering user:", err);
//         setError(err instanceof Error ? err : new Error(String(err)));
//         setIsAuthLoading(false);
//       }
//     };

//     checkAndRegisterUser();
//   }, [isSDKLoaded, user, address]);

//   const value = {
//     dbUser,
//     isAuthLoading,
//     isAuthenticated: !!dbUser,
//     error,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
