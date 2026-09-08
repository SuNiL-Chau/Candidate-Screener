import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";

export interface AppUser {
  id: string;
  email: string;
}

export const DEMO_USER_ID = "usr_recruiter_demo";
export const DEMO_USER_EMAIL = "recruiter@crystalgroup.com";

/**
 * Ensures a default recruiter user exists in database for local dev / testing.
 */
export async function getOrCreateDefaultUser(): Promise<AppUser> {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
    },
  });

  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Retrieves the currently authenticated recruiter.
 * Reads the session cookie 'screener_session'.
 * If not present, returns null (or default user if running in demo mode).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("screener_session");

    if (sessionCookie && sessionCookie.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        if (parsed?.email) {
          // Ensure user exists in database
          const user = await prisma.user.upsert({
            where: { email: parsed.email },
            update: {},
            create: {
              email: parsed.email,
            },
          });
          return { id: user.id, email: user.email };
        }
      } catch {
        // invalid cookie format
      }
    }

    // Default recruiter session for seamless first-load experience if configured
    return await getOrCreateDefaultUser();
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
}
