import { Briefcase } from "lucide-react";

import { BadgeStatus } from "@/components/ui/badge-status";
import { EmptyState } from "@/components/ui/empty-state";
import type { VacancyRecord } from "@/domain/vacancies";
import { VACANCY_STATUS_LABELS, vacancyStatusBadge } from "@/domain/vacancies";
import { cn } from "@/lib/utils";

interface VacancyListProps {
  vacancies: VacancyRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function VacancyList({
  vacancies,
  selectedId,
  onSelect,
  emptyTitle,
  emptyDescription,
}: VacancyListProps) {
  if (vacancies.length === 0) {
    return <EmptyState icon={Briefcase} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="d-flex flex-column gap-2">
      {vacancies.map((vacancy) => {
        const isSelected = vacancy.id === selectedId;

        return (
          <button
            key={vacancy.id}
            type="button"
            onClick={() => onSelect(vacancy.id)}
            className={cn(
              "list-group-item list-group-item-action text-start border rounded p-3",
              isSelected && "border-primary bg-primary-subtle",
            )}
            aria-pressed={isSelected}
          >
            <span className="d-flex align-items-start justify-content-between gap-2">
              <span className="fw-semibold text-dark">{vacancy.title}</span>
              <BadgeStatus
                status={vacancyStatusBadge(vacancy.status)}
                label={VACANCY_STATUS_LABELS[vacancy.status]}
              />
            </span>
            <span className="d-flex flex-wrap gap-2 small text-muted mt-2">
              <span>{vacancy.requirements.length} requisito(s)</span>
              <span aria-hidden="true">·</span>
              <span>Registrada el {formatDate(vacancy.createdAt)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
