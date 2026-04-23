import { getDbData } from "@/lib/db";
import RulesClient from "./RulesClient";

export default async function RulesPage() {
  const dbData = await getDbData();
  const rules = dbData?.rules || [];

  return <RulesClient initialRules={rules} />;
}