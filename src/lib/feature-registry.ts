import { manifest as vacanciesManifest } from "@/features/registrar-vacantes-con-sus-requisitos/manifest";
import type { FeatureGroup, FeatureManifest } from "@/features/types";

export const features: FeatureManifest[] = [vacanciesManifest];
export const featureGroups: FeatureGroup[] = [
  {
    label: "Área Responsable de recursos humanos",
    features: [vacanciesManifest],
  },
];
