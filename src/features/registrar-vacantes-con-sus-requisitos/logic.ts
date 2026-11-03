import type { VacancyDraftInput, VacancyFieldErrors, VacancyStatus } from "@/domain/vacancies";

export const REQUIRED_REQUIREMENT_MESSAGE = "Debe registrar al menos un requisito";
export const EDIT_BLOCKED_MESSAGE = "Solo se pueden editar vacantes abiertas";

export interface VacancyValidationResult {
  valid: boolean;
  fieldErrors: VacancyFieldErrors;
  error?: string;
}

export interface EditGuardResult {
  allowed: boolean;
  message?: string;
}

export function normalizeRequirements(requirements: string[]): string[] {
  if (!Array.isArray(requirements)) {
    return [];
  }

  return requirements
    .filter((requirement): requirement is string => typeof requirement === "string")
    .map((requirement) => requirement.trim())
    .filter((requirement) => requirement.length > 0);
}

export function validateVacancyDraft(input: VacancyDraftInput): VacancyValidationResult {
  const fieldErrors: VacancyFieldErrors = {};
  const title = typeof input.title === "string" ? input.title : "";
  const description = typeof input.description === "string" ? input.description : "";

  if (title.trim().length === 0) {
    fieldErrors.title = "El título es obligatorio.";
  }

  if (description.trim().length === 0) {
    fieldErrors.description = "La descripción del puesto es obligatoria.";
  }

  if (normalizeRequirements(input.requirements).length === 0) {
    fieldErrors.requirements = REQUIRED_REQUIREMENT_MESSAGE;
  }

  const error = fieldErrors.title ?? fieldErrors.description ?? fieldErrors.requirements;

  return {
    valid: error === undefined,
    fieldErrors,
    error,
  };
}

export function canEditVacancy(status: VacancyStatus | string): EditGuardResult {
  if (status === "abierta") {
    return { allowed: true };
  }

  return { allowed: false, message: EDIT_BLOCKED_MESSAGE };
}
