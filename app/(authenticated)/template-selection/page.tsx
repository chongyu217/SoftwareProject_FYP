import { getDbData } from "@/lib/db";
import TemplateClient from "./TemplateClient";

export default async function TemplateSelectionPage() {
  const dbData = await getDbData();
  const templates = dbData?.templates || [];

  return <TemplateClient templates={templates} />;
}