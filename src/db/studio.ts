import { and, asc, count, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  chatMessages,
  designProjects,
  reelProjects,
  supportTickets,
  users,
} from './schema.ts';

export async function listDesignProjects(userId: number) {
  try {
    return await db
      .select()
      .from(designProjects)
      .where(eq(designProjects.userId, userId))
      .orderBy(desc(designProjects.updatedAt));
  } catch (error) {
    console.error('Database error in listDesignProjects:', error);
    throw new Error('Failed to load saved design projects.', { cause: error });
  }
}

export async function saveDesignProject(input: {
  id?: number;
  userId: number;
  title: string;
  category: string;
  width: number;
  height: number;
  backgroundColor: string;
  layersJson: string;
  prompt?: string | null;
}) {
  try {
    if (input.id) {
      const updated = await db
        .update(designProjects)
        .set({
          title: input.title,
          category: input.category,
          width: input.width,
          height: input.height,
          backgroundColor: input.backgroundColor,
          layersJson: input.layersJson,
          prompt: input.prompt ?? null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(designProjects.id, input.id),
            eq(designProjects.userId, input.userId)
          )
        )
        .returning();
      if (updated.length > 0) return updated[0];
    }

    const inserted = await db
      .insert(designProjects)
      .values({
        userId: input.userId,
        title: input.title,
        category: input.category,
        width: input.width,
        height: input.height,
        backgroundColor: input.backgroundColor,
        layersJson: input.layersJson,
        prompt: input.prompt ?? null,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database error in saveDesignProject:', error);
    throw new Error('Failed to save design project.', { cause: error });
  }
}

export async function deleteDesignProject(id: number, userId: number) {
  try {
    const deleted = await db
      .delete(designProjects)
      .where(and(eq(designProjects.id, id), eq(designProjects.userId, userId)))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    console.error('Database error in deleteDesignProject:', error);
    throw new Error('Failed to delete design project.', { cause: error });
  }
}

export async function listReelProjects(userId: number) {
  try {
    return await db
      .select()
      .from(reelProjects)
      .where(eq(reelProjects.userId, userId))
      .orderBy(desc(reelProjects.updatedAt));
  } catch (error) {
    console.error('Database error in listReelProjects:', error);
    throw new Error('Failed to load saved reel projects.', { cause: error });
  }
}

export async function saveReelProject(input: {
  id?: number;
  userId: number;
  title: string;
  idea: string;
  voiceAccent: string;
  voiceName: string;
  hookScript: string;
  scenesJson: string;
  captionStyle: string;
}) {
  try {
    if (input.id) {
      const updated = await db
        .update(reelProjects)
        .set({
          title: input.title,
          idea: input.idea,
          voiceAccent: input.voiceAccent,
          voiceName: input.voiceName,
          hookScript: input.hookScript,
          scenesJson: input.scenesJson,
          captionStyle: input.captionStyle,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(reelProjects.id, input.id),
            eq(reelProjects.userId, input.userId)
          )
        )
        .returning();
      if (updated.length > 0) return updated[0];
    }

    const inserted = await db
      .insert(reelProjects)
      .values({
        userId: input.userId,
        title: input.title,
        idea: input.idea,
        voiceAccent: input.voiceAccent,
        voiceName: input.voiceName,
        hookScript: input.hookScript,
        scenesJson: input.scenesJson,
        captionStyle: input.captionStyle,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database error in saveReelProject:', error);
    throw new Error('Failed to save reel project.', { cause: error });
  }
}

export async function deleteReelProject(id: number, userId: number) {
  try {
    const deleted = await db
      .delete(reelProjects)
      .where(and(eq(reelProjects.id, id), eq(reelProjects.userId, userId)))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    console.error('Database error in deleteReelProject:', error);
    throw new Error('Failed to delete reel project.', { cause: error });
  }
}

export async function createSupportTicket(input: {
  userId?: number | null;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}) {
  try {
    const inserted = await db
      .insert(supportTickets)
      .values({
        userId: input.userId ?? null,
        email: input.email,
        subject: input.subject,
        category: input.category,
        priority: input.priority,
        message: input.message,
        status: 'Open',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database error in createSupportTicket:', error);
    throw new Error('Failed to submit support ticket.', { cause: error });
  }
}

export async function listSupportTickets(userId: number) {
  try {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  } catch (error) {
    console.error('Database error in listSupportTickets:', error);
    throw new Error('Failed to load support tickets.', { cause: error });
  }
}

export async function listAllSupportTickets() {
  try {
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  } catch (error) {
    console.error('Database error in listAllSupportTickets:', error);
    throw new Error('Failed to load all support tickets.', { cause: error });
  }
}

export async function updateSupportTicketStatus(id: number, status: string) {
  try {
    const rows = await db
      .update(supportTickets)
      .set({ status })
      .where(eq(supportTickets.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database error in updateSupportTicketStatus:', error);
    throw new Error('Failed to update ticket status.', { cause: error });
  }
}

export async function listChatMessages(userId: number) {
  try {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.createdAt));
  } catch (error) {
    console.error('Database error in listChatMessages:', error);
    throw new Error('Failed to load AI chat history.', { cause: error });
  }
}

export async function addChatMessage(input: {
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  mode: string;
}) {
  try {
    const inserted = await db
      .insert(chatMessages)
      .values(input)
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database error in addChatMessage:', error);
    throw new Error('Failed to save chat message.', { cause: error });
  }
}

export async function clearChatMessages(userId: number) {
  try {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  } catch (error) {
    console.error('Database error in clearChatMessages:', error);
    throw new Error('Failed to clear chat history.', { cause: error });
  }
}

export async function getAdminOverviewStats() {
  try {
    const [uCount, dCount, rCount, tCount] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(designProjects),
      db.select({ value: count() }).from(reelProjects),
      db.select({ value: count() }).from(supportTickets),
    ]);
    return {
      totalUsers: uCount[0]?.value ?? 0,
      totalDesigns: dCount[0]?.value ?? 0,
      totalReels: rCount[0]?.value ?? 0,
      totalTickets: tCount[0]?.value ?? 0,
    };
  } catch (error) {
    console.error('Database error in getAdminOverviewStats:', error);
    throw new Error('Failed to compute admin stats.', { cause: error });
  }
}
