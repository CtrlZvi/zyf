import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { accounts } from "../accounts/schema";

export const transactions = sqliteTable("transactions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    description: text("description"),
    credit: integer("credit")
        .references(() => entries.id)
        .unique(),
    debit: integer("debit")
        .references(() => entries.id)
        .unique(),
});

export const transactionRelations = relations(transactions, ({ one }) => ({
    credit: one(entries, {
        fields: [transactions.credit],
        references: [entries.id],
    }),
    debit: one(entries, {
        fields: [transactions.debit],
        references: [entries.id],
    }),
}));

export const entries = sqliteTable("entries", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    description: text("description"),
    amount: integer("amount").notNull(),
    account: integer("account").references(() => accounts.id),
});

export const entryRelations = relations(entries, ({ one }) => ({
    account: one(accounts, {
        fields: [entries.account],
        references: [accounts.id],
    }),
}));
