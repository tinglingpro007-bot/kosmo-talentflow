import { Briefcase } from "lucide-react";

import type { FeatureManifest } from "@/features/types";

export const manifest: FeatureManifest = {
  slug: "registrar-vacantes-con-sus-requisitos",
  title: "Vacantes",
  description: "Registra vacantes con su descripción, requisitos y estado abierto para consulta.",
  route: "/registrar-vacantes-con-sus-requisitos",
  icon: Briefcase,
  group: "Área Responsable de recursos humanos",
  actor: "Responsable de recursos humanos",
};
