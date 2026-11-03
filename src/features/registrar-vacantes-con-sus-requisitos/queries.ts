import { asc, desc } from "drizzle-orm";

import { db } from "@/db";
import { vacancies, vacancyRequirements } from "@/db/schema";
import { isVacancyStatus, type VacancyRecord } from "@/domain/vacancies";

export async function listVacanciesWithRequirements(): Promise<VacancyRecord[]> {
  const vacancyRows = await db.select().from(vacancies).orderBy(desc(vacancies.createdAt));
  const requirementRows = await db
    .select()
    .from(vacancyRequirements)
    .orderBy(asc(vacancyRequirements.position));

  return vacancyRows.map((vacancy) => ({
    id: vacancy.id,
    title: vacancy.title,
    description: vacancy.description,
    status: isVacancyStatus(vacancy.status) ? vacancy.status : "abierta",
    createdAt: vacancy.createdAt,
    updatedAt: vacancy.updatedAt,
    requirements: requirementRows
      .filter((requirement) => requirement.vacancyId === vacancy.id)
      .map((requirement) => ({
        id: requirement.id,
        description: requirement.description,
      })),
  }));
}
