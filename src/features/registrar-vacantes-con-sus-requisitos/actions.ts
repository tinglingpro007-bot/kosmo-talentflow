"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { vacancies, vacancyRequirements } from "@/db/schema";
import type { VacancyActionResult, VacancyDraftInput } from "@/domain/vacancies";

import {
  EDIT_BLOCKED_MESSAGE,
  normalizeRequirements,
  validateVacancyDraft,
} from "./logic";

const VACANCIES_PATH = "/registrar-vacantes-con-sus-requisitos";

function invalidResult(input: VacancyDraftInput): VacancyActionResult {
  const validation = validateVacancyDraft(input);

  return {
    success: false,
    error: validation.error ?? "Revisa los datos de la vacante.",
    fieldErrors: validation.fieldErrors,
  };
}

export async function createVacancyAction(input: VacancyDraftInput): Promise<VacancyActionResult> {
  const validation = validateVacancyDraft(input);
  if (!validation.valid) {
    return invalidResult(input);
  }

  const vacancyId = crypto.randomUUID();
  const title = input.title.trim();
  const description = input.description.trim();
  const requirements = normalizeRequirements(input.requirements);
  const now = new Date();

  try {
    db.transaction((tx) => {
      tx.insert(vacancies)
        .values({
          id: vacancyId,
          title,
          description,
          status: "abierta",
          createdAt: now,
          updatedAt: now,
        })
        .run();

      tx.insert(vacancyRequirements)
        .values(
          requirements.map((requirement, index) => ({
            id: crypto.randomUUID(),
            vacancyId,
            description: requirement,
            position: index,
          })),
        )
        .run();
    });

    revalidatePath(VACANCIES_PATH);
    return { success: true, vacancyId };
  } catch {
    return { success: false, error: "No se pudo registrar la vacante. Intenta nuevamente." };
  }
}

export async function updateVacancyAction(
  vacancyId: string,
  input: VacancyDraftInput,
): Promise<VacancyActionResult> {
  const existingRows = await db
    .select()
    .from(vacancies)
    .where(eq(vacancies.id, vacancyId))
    .limit(1);
  const existing = existingRows[0];

  if (!existing) {
    return { success: false, error: "La vacante no existe." };
  }

  if (existing.status !== "abierta") {
    return { success: false, error: EDIT_BLOCKED_MESSAGE };
  }

  const validation = validateVacancyDraft(input);
  if (!validation.valid) {
    return invalidResult(input);
  }

  const title = input.title.trim();
  const description = input.description.trim();
  const requirements = normalizeRequirements(input.requirements);

  try {
    db.transaction((tx) => {
      tx.update(vacancies)
        .set({ title, description, updatedAt: new Date() })
        .where(eq(vacancies.id, vacancyId))
        .run();

      tx.delete(vacancyRequirements)
        .where(eq(vacancyRequirements.vacancyId, vacancyId))
        .run();

      tx.insert(vacancyRequirements)
        .values(
          requirements.map((requirement, index) => ({
            id: crypto.randomUUID(),
            vacancyId,
            description: requirement,
            position: index,
          })),
        )
        .run();
    });

    revalidatePath(VACANCIES_PATH);
    return { success: true, vacancyId };
  } catch {
    return { success: false, error: "No se pudieron guardar los cambios. Intenta nuevamente." };
  }
}
