"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Trash } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Steps, type StepItem } from "@/components/ui/steps";
import { Textarea } from "@/components/ui/textarea";
import type { VacancyFieldErrors, VacancyRecord } from "@/domain/vacancies";

import { createVacancyAction, updateVacancyAction } from "../actions";
import { normalizeRequirements, REQUIRED_REQUIREMENT_MESSAGE, validateVacancyDraft } from "../logic";

interface VacancyFormModalProps {
  vacancy: VacancyRecord | null;
  onClose: () => void;
  onSaved: (vacancyId: string) => void;
}

const steps: StepItem[] = [
  { id: 1, title: "Datos del puesto", description: "Título y descripción" },
  { id: 2, title: "Requisitos", description: "Qué debe cumplir" },
  { id: 3, title: "Revisión", description: "Confirma y guarda" },
];

export function VacancyFormModal({ vacancy, onClose, onSaved }: VacancyFormModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(vacancy?.title ?? "");
  const [description, setDescription] = useState(vacancy?.description ?? "");
  const [requirements, setRequirements] = useState<string[]>(
    vacancy?.requirements.map((requirement) => requirement.description) ?? [],
  );
  const [requirementInput, setRequirementInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<VacancyFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = vacancy !== null;

  function addRequirement() {
    const value = requirementInput.trim();
    if (value.length === 0) {
      return;
    }

    setRequirements((current) => [...current, value]);
    setRequirementInput("");
    setFieldErrors((current) => ({ ...current, requirements: undefined }));
    setError(null);
  }

  function removeRequirement(index: number) {
    setRequirements((current) => current.filter((_, position) => position !== index));
  }

  function goNext() {
    if (step === 1) {
      const errors: VacancyFieldErrors = {};
      if (title.trim().length === 0) {
        errors.title = "El título es obligatorio.";
      }
      if (description.trim().length === 0) {
        errors.description = "La descripción del puesto es obligatoria.";
      }
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setError(null);
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (normalizeRequirements(requirements).length === 0) {
        setFieldErrors({ requirements: REQUIRED_REQUIREMENT_MESSAGE });
        setError(REQUIRED_REQUIREMENT_MESSAGE);
        return;
      }
      setFieldErrors({});
      setError(null);
      setStep(3);
    }
  }

  function handleSave() {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      requirements: normalizeRequirements(requirements),
    };
    const validation = validateVacancyDraft(payload);

    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      setError(validation.error ?? "Revisa los datos de la vacante.");
      if (validation.fieldErrors.title || validation.fieldErrors.description) {
        setStep(1);
      } else if (validation.fieldErrors.requirements) {
        setStep(2);
      }
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = vacancy
        ? await updateVacancyAction(vacancy.id, payload)
        : await createVacancyAction(payload);

      if (!result.success || !result.vacancyId) {
        setError(result.error ?? "No se pudo guardar la vacante.");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }

      onSaved(result.vacancyId);
    });
  }

  const footer = (
    <div className="d-flex justify-content-between align-items-center w-100 gap-2">
      <Button variant="light" onClick={onClose} disabled={isPending}>
        Cancelar
      </Button>
      <div className="d-flex align-items-center gap-2">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep((current) => current - 1)} disabled={isPending}>
            Atrás
          </Button>
        ) : null}
        {step < 3 ? (
          <Button onClick={goNext}>Siguiente</Button>
        ) : (
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar vacante"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? "Editar vacante" : "Nueva vacante"}
      size="lg"
      footer={footer}
    >
      <Steps steps={steps} currentStep={step} />

      {error ? (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {step === 1 ? (
        <Card className="mt-3">
          <CardBody className="d-flex flex-column gap-3">
            <div>
              <Label htmlFor="vacancy-title">Título de la vacante</Label>
              <Input
                id="vacancy-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                isInvalid={Boolean(fieldErrors.title)}
                placeholder="Analista de ventas"
                autoFocus
              />
              {fieldErrors.title ? (
                <div className="invalid-feedback d-block">{fieldErrors.title}</div>
              ) : null}
            </div>
            <div>
              <Label htmlFor="vacancy-description">Descripción del puesto</Label>
              <Textarea
                id="vacancy-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                isInvalid={Boolean(fieldErrors.description)}
                rows={4}
                placeholder="Describe las funciones y responsabilidades del puesto."
              />
              {fieldErrors.description ? (
                <div className="invalid-feedback d-block">{fieldErrors.description}</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="mt-3">
          <CardBody className="d-flex flex-column gap-3">
            <div>
              <Label htmlFor="vacancy-requirement">Nuevo requisito</Label>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Input
                  id="vacancy-requirement"
                  value={requirementInput}
                  onChange={(event) => setRequirementInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addRequirement();
                    }
                  }}
                  placeholder="Experiencia mínima de 2 años en ventas"
                />
                <Button variant="outline" onClick={addRequirement} className="flex-shrink-0">
                  <Plus size={16} />
                  Agregar requisito
                </Button>
              </div>
            </div>

            {fieldErrors.requirements ? (
              <div className="text-danger small">{fieldErrors.requirements}</div>
            ) : null}

            <div>
              <h6 className="text-secondary text-uppercase small fw-semibold mb-2">
                Requisitos en la lista ({requirements.length})
              </h6>
              {requirements.length === 0 ? (
                <p className="text-muted small mb-0">
                  Aún no has agregado requisitos. Registra al menos uno para continuar.
                </p>
              ) : (
                <ul className="list-group list-group-flush">
                  {requirements.map((requirement, index) => (
                    <li
                      key={`${index}-${requirement}`}
                      className="list-group-item d-flex align-items-center justify-content-between gap-2 px-0"
                    >
                      <span className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" />
                        {requirement}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        aria-label={`Eliminar requisito ${requirement}`}
                      >
                        <Trash size={14} />
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="mt-3">
          <CardBody className="d-flex flex-column gap-3">
            <div>
              <h6 className="text-secondary text-uppercase small fw-semibold mb-1">Título</h6>
              <p className="mb-0 text-dark">{title.trim()}</p>
            </div>
            <div>
              <h6 className="text-secondary text-uppercase small fw-semibold mb-1">Descripción</h6>
              <p className="mb-0 text-dark" style={{ whiteSpace: "pre-line" }}>
                {description.trim()}
              </p>
            </div>
            <div>
              <h6 className="text-secondary text-uppercase small fw-semibold mb-1">
                Requisitos ({normalizeRequirements(requirements).length})
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {normalizeRequirements(requirements).map((requirement) => (
                  <li key={requirement} className="d-flex align-items-start gap-2">
                    <Check size={16} className="text-success flex-shrink-0 mt-1" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-muted small mb-0">
              Al guardar, la vacante quedará con estado abierta y disponible para consulta.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </Modal>
  );
}
