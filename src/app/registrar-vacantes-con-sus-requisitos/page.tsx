import { VacanciesWorkspace } from "@/features/registrar-vacantes-con-sus-requisitos/components/vacancies-workspace";
import { listVacanciesWithRequirements } from "@/features/registrar-vacantes-con-sus-requisitos/queries";

export const dynamic = "force-dynamic";

export default async function VacanciesPage() {
  const vacancies = await listVacanciesWithRequirements();

  return <VacanciesWorkspace vacancies={vacancies} />;
}
