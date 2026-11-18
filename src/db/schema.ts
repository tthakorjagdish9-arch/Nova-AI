import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  credits: integer('credits').notNull().default(50),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const designProjects = pgTable('design_projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  backgroundColor: text('background_color').notNull(),
  layersJson: text('layers_json').notNull(),
  prompt: text('prompt'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reelProjects = pgTable('reel_projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  idea: text('idea').notNull(),
  voiceAccent: text('voice_accent').notNull(),
  voiceName: text('voice_name').notNull(),
  hookScript: text('hook_script').notNull(),
  scenesJson: text('scenes_json').notNull(),
  captionStyle: text('caption_style').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  category: text('category').notNull(),
  priority: text('priority').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('Open'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  mode: text('mode').notNull().default('Creative Studio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  designProjects: many(designProjects),
  reelProjects: many(reelProjects),
  supportTickets: many(supportTickets),
  chatMessages: many(chatMessages),
}));

export const designProjectsRelations = relations(designProjects, ({ one }) => ({
  author: one(users, {
    fields: [designProjects.userId],
    references: [users.id],
  }),
}));

export const reelProjectsRelations = relations(reelProjects, ({ one }) => ({
  author: one(users, {
    fields: [reelProjects.userId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  author: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  author: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));
