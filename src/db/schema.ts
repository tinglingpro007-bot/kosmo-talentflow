// Database schema definitions using Drizzle ORM (SQLite)

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vacancies = sqliteTable("vacancies", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("abierta"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const vacancyRequirements = sqliteTable("vacancy_requirements", {
  id: text("id").primaryKey(),
  vacancyId: text("vacancy_id")
    .notNull()
    .references(() => vacancies.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  position: integer("position").notNull().default(0),
});

export type Vacancy = typeof vacancies.$inferSelect;
export type NewVacancy = typeof vacancies.$inferInsert;
export type VacancyRequirement = typeof vacancyRequirements.$inferSelect;
export type NewVacancyRequirement = typeof vacancyRequirements.$inferInsert;
