import {
  pgTable,
  integer,
  text,
  varchar,
  primaryKey,
  timestamp,
  pgEnum,
  uuid,
  boolean,
  serial,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { InferSelectModel, relations, sql } from 'drizzle-orm';
import type { AdapterAccount } from 'next-auth/adapters';

type Provider = 'github' | 'google';

export const colour = pgEnum('colour', [
  'tiffany',
  'blue',
  'mindaro',
  'sunset',
  'melon',
  'tickle',
  'wisteria',
  'cambridge',
  'mikado',
  'slate',
]);

export const noteFormat = pgEnum('note_format', ['full', 'slim']);

export const user = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
});

export const account = pgTable(
  'accounts',
  {
    userId: varchar('userId', { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 8 }).$type<AdapterAccount>().notNull(),
    provider: varchar('provider', { length: 8 }).$type<Provider>().notNull(),
    providerAccountId: integer('providerAccountId').notNull(),
    refresh_token: varchar('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 24 }),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const note = pgTable('notes', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  isFavourite: boolean('is_favourite').default(false),
  isArchived: boolean('is_archived').default(false),
  isPublic: boolean('is_public').default(false).notNull(),
  userId: varchar('userId', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  colour: colour('colour').notNull(),
  lastUpdate: timestamp('last_update', { mode: 'date' }).defaultNow(),
});

export const userPreferences = pgTable('users_preferences', {
  id: serial('id').unique().primaryKey(),
  userId: varchar('userId', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  noteFormat: noteFormat('note_format').default('full').notNull(),
  fullNote: boolean('full_note').default(true).notNull(),
});

export const passwordResetToken = pgTable('password_reset_tokens', {
  id: serial('id').unique().primaryKey(),
  email: varchar('email').notNull(),
  token: varchar('token').unique().notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  note: many(note),
  account: many(account),
  preferences: one(userPreferences, {
    fields: [user.id],
    references: [userPreferences.userId],
  }),
}));

export const noteRelations = relations(note, ({ one }) => ({
  owner: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
}));

export type Note = InferSelectModel<typeof note>;
export type User = InferSelectModel<typeof user>;
