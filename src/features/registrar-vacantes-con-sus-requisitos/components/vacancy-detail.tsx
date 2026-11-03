import { Check, Pencil, Users } from "lucide-react";

import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import type { VacancyRecord } from "@/domain/vacancies";
import { VACANCY_STATUS_LABELS, vacancyStatusBadge } from "@/domain/vacancies";

interface VacancyDetailProps {
  vacancy: VacancyRecord;
  onEdit?: (vacancy: VacancyRecord) => void;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function VacancyDetail({ vacancy, onEdit }: VacancyDetailProps) {
  return (
    <div className="d-flex flex-column gap-3">
      <Card>
        <CardHeader className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-3">
          <div>
            <CardTitle>{vacancy.title}</CardTitle>
            <CardDescription>Registrada el {formatDate(vacancy.createdAt)}</CardDescription>
          </div>
          <div className="d-flex align-items-center gap-2">
            <BadgeStatus
              status={vacancyStatusBadge(vacancy.status)}
              label={VACANCY_STATUS_LABELS[vacancy.status]}
            />
            {onEdit ? (
              <Button variant="outline" size="sm" onClick={() => onEdit(vacancy)}>
                <Pencil size={14} />
                Editar
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardBody>
          <section className="mb-4">
            <h6 className="text-secondary text-uppercase small fw-semibold mb-2">
              Descripción del puesto
            </h6>
            <p className="mb-0 text-dark" style={{ whiteSpace: "pre-line" }}>
              {vacancy.description}
            </p>
          </section>

          <section>
            <h6 className="text-secondary text-uppercase small fw-semibold mb-2">
              Requisitos registrados ({vacancy.requirements.length})
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {vacancy.requirements.map((requirement) => (
                <li key={requirement.id} className="d-flex align-items-start gap-2">
                  <Check size={16} className="text-success flex-shrink-0 mt-1" />
                  <span className="text-dark">{requirement.description}</span>
                </li>
              ))}
            </ul>
          </section>
        </CardBody>
      </Card>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Candidatos asociados</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                icon={Users}
                title="Sin candidatos asociados"
                description="Aún no hay postulaciones registradas para esta vacante."
              />
            </CardBody>
          </Card>
        </div>
        <div className="col-12 col-md-6">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Trazabilidad</CardTitle>
            </CardHeader>
            <CardBody>
              <Timeline>
                <TimelineItem
                  title="Vacante registrada"
                  timestamp={formatDate(vacancy.createdAt)}
                  variant="primary"
                />
                <TimelineItem
                  title="Última actualización"
                  timestamp={formatDate(vacancy.updatedAt)}
                  variant="success"
                />
              </Timeline>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
