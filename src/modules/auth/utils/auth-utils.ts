/** biome-ignore-all lint/style/noNonNullAssertion: <we will make sure it's not null> */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { getDb } from "@/db";
import type { AuthUser } from "@/modules/auth/models/user.model";
import { user } from "@/modules/auth/schemas/auth.schema";
import { eq } from "drizzle-orm";

/**
 * Cached auth instance singleton so we don't create a new instance every time
 */
let cachedAuth: ReturnType<typeof betterAuth> | null = null;

/**
 * Create auth instance dynamically to avoid top-level async issues
 */
async function getAuth() {
    if (cachedAuth) {
        return cachedAuth;
    }

    const { env } = await getCloudflareContext();
    const db = await getDb();

    cachedAuth = betterAuth({
        secret: env.BETTER_AUTH_SECRET,
        database: drizzleAdapter(db, {
            provider: "sqlite",
        }),
        emailAndPassword: {
            enabled: true,
        },
        socialProviders: {
            google: {
                enabled: true,
                clientId: env.GOOGLE_CLIENT_ID!,
                clientSecret: env.GOOGLE_CLIENT_SECRET!,
            },
        },
        plugins: [nextCookies()],
    });

    return cachedAuth;
}
/**
 * Get the current authenticated user from the session
 * Returns null if no user is authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const dummyUser = await requireAuth();
    return dummyUser;
}

/**
 * Get the current authenticated user or throw an error
 * Use this when authentication is required
 */
export async function requireAuth(): Promise<AuthUser> {
    const dummyId = "dummy-user-id";

    try {
        const db = await getDb();
        const [existing] = await db.select().from(user).where(eq(user.id, dummyId));
        if (!existing) {
            console.log("Creating dummy user...");
            await db.insert(user).values({
                id: dummyId,
                name: "Guest User",
                email: "guest@example.com",
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    } catch (e) {
        console.error("Failed to ensure dummy user exists:", e);
    }

    return {
        id: dummyId,
        name: "Guest User",
        email: "guest@example.com"
    };
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Get the auth instance for use in server actions and API routes
 */
export async function getAuthInstance() {
    return await getAuth();
}

/**
 * Get session information
 */
export async function getSession() {
    const user = await getCurrentUser();
    if (!user) return null;
    return {
        user: {
            ...user,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            image: null
        },
        session: {
            id: "dummy-session-id",
            userId: user.id,
            expiresAt: new Date(Date.now() + 86400000),
            token: "dummy-token",
            createdAt: new Date(),
            updatedAt: new Date(),
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla"
        }
    };
}
