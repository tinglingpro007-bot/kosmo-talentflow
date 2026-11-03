"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, UserRound } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Toast, ToastContainer } from "@/components/ui/toast";
import type { VacancyRecord } from "@/domain/vacancies";

import { canEditVacancy } from "../logic";
import { VacancyDetail } from "./vacancy-detail";
import { VacancyFormModal } from "./vacancy-form-modal";
import { VacancyList } from "./vacancy-list";

interface VacanciesWorkspaceProps {
  vacancies: VacancyRecord[];
}

type Role = "rrhh" | "candidato";

export function VacanciesWorkspace({ vacancies }: VacanciesWorkspaceProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("rrhh");
  const [selectedId, setSelectedId] = useState<string | null>(vacancies[0]?.id ?? null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<VacancyRecord | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openVacancies = useMemo(
    () => vacancies.filter((vacancy) => vacancy.status === "abierta"),
    [vacancies],
  );

  const visibleVacancies = role === "rrhh" ? vacancies : openVacancies;
  const selectedVacancy = visibleVacancies.find((vacancy) => vacancy.id === selectedId) ?? null;

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setAlertMessage(null);

    if (nextRole === "candidato") {
      setSelectedId(openVacancies[0]?.id ?? null);
    } else {
      setSelectedId(vacancies[0]?.id ?? null);
    }
  }

  function openCreateForm() {
    setEditingVacancy(null);
    setAlertMessage(null);
    setIsFormOpen(true);
  }

  function handleEdit(vacancy: VacancyRecord) {
    const guard = canEditVacancy(vacancy.status);
    if (!guard.allowed) {
      setAlertMessage(guard.message ?? "No se puede editar esta vacante.");
      return;
    }

    setEditingVacancy(vacancy);
    setAlertMessage(null);
    setIsFormOpen(true);
  }

  function handleSaved(vacancyId: string) {
    setIsFormOpen(false);
    setSelectedId(vacancyId);
    setToastMessage(editingVacancy ? "Cambios guardados correctamente." : "Vacante registrada correctamente.");
    setEditingVacancy(null);
    router.refresh();
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Vacantes"
        description="Registra puestos con su descripción y requisitos, y consulta su estado vigente."
        actions={
          role === "rrhh" ? (
            <Button onClick={openCreateForm}>
              <Plus size={16} />
              Nueva vacante
            </Button>
          ) : null
        }
      />

      <Tabs
        items={[
          {
            id: "rrhh",
            label: "Responsable de recursos humanos",
            icon: <Briefcase size={16} />,
            badge: vacancies.length,
          },
          {
            id: "candidato",
            label: "Candidato",
            icon: <UserRound size={16} />,
            badge: openVacancies.length,
          },
        ]}
        activeId={role}
        onChange={(id) => changeRole(id as Role)}
        variant="pills"
      />

      {alertMessage ? (
        <Alert variant="danger" onClose={() => setAlertMessage(null)}>
          {alertMessage}
        </Alert>
      ) : null}

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>{role === "rrhh" ? "Vacantes registradas" : "Vacantes abiertas"}</CardTitle>
              <CardDescription>
                {role === "rrhh"
                  ? "Selecciona una vacante para consultar su detalle."
                  : "Puestos disponibles para postulación."}
              </CardDescription>
            </CardHeader>
            <CardBody>
              <VacancyList
                vacancies={visibleVacancies}
                selectedId={selectedId}
                onSelect={setSelectedId}
                emptyTitle={role === "rrhh" ? "Aún no hay vacantes" : "No hay vacantes abiertas"}
                emptyDescription={
                  role === "rrhh"
                    ? "Registra la primera vacante con su descripción y requisitos."
                    : "Cuando se publique una vacante abierta aparecerá aquí."
                }
              />
            </CardBody>
          </Card>
        </div>

        <div className="col-12 col-lg-8">
          {selectedVacancy ? (
            <VacancyDetail
              vacancy={selectedVacancy}
              onEdit={role === "rrhh" ? handleEdit : undefined}
            />
          ) : (
            <Card className="h-100">
              <CardBody className="h-100 d-flex">
                <EmptyState
                  icon={Briefcase}
                  title="Selecciona una vacante"
                  description="Elige una vacante del listado para ver su descripción, requisitos y estado."
                  className="w-100 my-auto"
                />
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {isFormOpen ? (
        <VacancyFormModal
          key={editingVacancy?.id ?? "new-vacancy"}
          vacancy={editingVacancy}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleSaved}
        />
      ) : null}

      {toastMessage ? (
        <ToastContainer position="bottom-end">
          <Toast
            title={toastMessage}
            variant="success"
            duration={4000}
            onClose={() => setToastMessage(null)}
          />
        </ToastContainer>
      ) : null}
    </div>
  );
}
