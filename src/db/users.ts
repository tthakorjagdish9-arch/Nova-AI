import { count, desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

const OWNER_ADMIN_EMAIL = 'tthakorjagdish9@gmail.com';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null,
  photoUrl?: string | null
) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          email,
          displayName: displayName ?? existing[0].displayName,
          photoUrl: photoUrl ?? existing[0].photoUrl,
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    // Check if this is the first user or owner email to assign admin role cleanly
    const [{ total }] = await db.select({ total: count() }).from(users);
    const assignedRole =
      total === 0 || email.toLowerCase() === OWNER_ADMIN_EMAIL
        ? 'admin'
        : 'user';

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
        photoUrl: photoUrl ?? null,
        credits: 50,
        role: assignedRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName ?? null,
          photoUrl: photoUrl ?? null,
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database error in getUserByUid:', error);
    throw new Error('Failed to load user profile.', { cause: error });
  }
}

export async function deductUserCredits(userId: number, amount: number) {
  try {
    const rows = await db
      .update(users)
      .set({
        credits: sql`GREATEST(${users.credits} - ${amount}, 0)`,
      })
      .where(eq(users.id, userId))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database error in deductUserCredits:', error);
    throw new Error('Failed to update credits.', { cause: error });
  }
}

export async function listAllUsers() {
  try {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database error in listAllUsers:', error);
    throw new Error('Failed to list users.', { cause: error });
  }
}

export async function adminUpdateUser(
  targetUserId: number,
  patch: { credits?: number; role?: string }
) {
  try {
    const updateData: { credits?: number; role?: string } = {};
    if (typeof patch.credits === 'number') {
      updateData.credits = Math.max(0, Math.round(patch.credits));
    }
    if (patch.role === 'admin' || patch.role === 'user') {
      updateData.role = patch.role;
    }
    const rows = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, targetUserId))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database error in adminUpdateUser:', error);
    throw new Error('Failed to update user account.', { cause: error });
  }
}
