import { describe, expect, it } from "vitest";

import {
  canEditVacancy,
  EDIT_BLOCKED_MESSAGE,
  normalizeRequirements,
  REQUIRED_REQUIREMENT_MESSAGE,
  validateVacancyDraft,
} from "../src/features/registrar-vacantes-con-sus-requisitos/logic";

describe("normalizeRequirements", () => {
  it("trims and drops empty requirements while keeping order", () => {
    // Arrange
    const requirements = ["  Experiencia en ventas  ", "   ", "Manejo de CRM"];

    // Act
    const result = normalizeRequirements(requirements);

    // Assert
    expect(result).toEqual(["Experiencia en ventas", "Manejo de CRM"]);
  });
});

describe("validateVacancyDraft", () => {
  it("returns valid when title, description and at least one requirement exist", () => {
    // Arrange
    const draft = {
      title: "Analista de ventas",
      description: "Gestionar la cartera de clientes.",
      requirements: ["Experiencia mínima de 2 años en ventas", "Manejo de CRM"],
    };

    // Act
    const result = validateVacancyDraft(draft);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.fieldErrors).toEqual({});
  });

  it("rejects when the title is empty", () => {
    // Arrange
    const draft = {
      title: "   ",
      description: "Gestionar la cartera de clientes.",
      requirements: ["Experiencia en ventas"],
    };

    // Act
    const result = validateVacancyDraft(draft);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.title).toBe("El título es obligatorio.");
  });

  it("rejects when the description is empty", () => {
    // Arrange
    const draft = {
      title: "Analista de ventas",
      description: "",
      requirements: ["Experiencia en ventas"],
    };

    // Act
    const result = validateVacancyDraft(draft);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.description).toBe("La descripción del puesto es obligatoria.");
  });

  it("rejects with the required message when there are no requirements", () => {
    // Arrange
    const draft = {
      title: "Analista de ventas",
      description: "Gestionar la cartera de clientes.",
      requirements: [],
    };

    // Act
    const result = validateVacancyDraft(draft);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.requirements).toBe(REQUIRED_REQUIREMENT_MESSAGE);
    expect(result.error).toBe("Debe registrar al menos un requisito");
  });

  it("rejects when requirements contain only whitespace", () => {
    // Arrange
    const draft = {
      title: "Analista de ventas",
      description: "Gestionar la cartera de clientes.",
      requirements: ["   ", "\n"],
    };

    // Act
    const result = validateVacancyDraft(draft);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.requirements).toBe(REQUIRED_REQUIREMENT_MESSAGE);
  });
});

describe("canEditVacancy", () => {
  it("allows editing an open vacancy", () => {
    // Arrange & Act
    const result = canEditVacancy("abierta");

    // Assert
    expect(result).toEqual({ allowed: true });
  });

  it("blocks editing a covered vacancy", () => {
    // Arrange & Act
    const result = canEditVacancy("cubierta");

    // Assert
    expect(result.allowed).toBe(false);
    expect(result.message).toBe(EDIT_BLOCKED_MESSAGE);
    expect(result.message).toBe("Solo se pueden editar vacantes abiertas");
  });
});
