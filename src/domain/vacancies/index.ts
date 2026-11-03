export type VacancyStatus = "abierta" | "cubierta";

export interface VacancyRequirementData {
  id: string;
  description: string;
}

export interface VacancyRecord {
  id: string;
  title: string;
  description: string;
  status: VacancyStatus;
  createdAt: Date;
  updatedAt: Date;
  requirements: VacancyRequirementData[];
}

export interface VacancyDraftInput {
  title: string;
  description: string;
  requirements: string[];
}

export interface VacancyFieldErrors {
  title?: string;
  description?: string;
  requirements?: string;
}

export interface VacancyActionResult {
  success: boolean;
  vacancyId?: string;
  error?: string;
  fieldErrors?: VacancyFieldErrors;
}

export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  abierta: "Abierta",
  cubierta: "Cubierta",
};

export const VACANCY_STATUS_BADGE: Record<VacancyStatus, "active" | "completed"> = {
  abierta: "active",
  cubierta: "completed",
};

export function isVacancyStatus(value: string): value is VacancyStatus {
  return value === "abierta" || value === "cubierta";
}

export function vacancyStatusBadge(status: VacancyStatus): "active" | "completed" {
  return VACANCY_STATUS_BADGE[status];
}
