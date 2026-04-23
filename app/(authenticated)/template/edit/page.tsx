import { getDbData } from "@/lib/db";
import EditTemplateClient from "./EditTemplateClient";

export default async function EditTemplatePage({ searchParams }: any) {
  // Await searchParams for Next.js 15+ compatibility
  const sp = await searchParams;
  
  const dbData = await getDbData();
  const template = dbData?.templates.find((t: any) => t.id === sp.id);

  if (!template) {
    return <div className="p-10 text-center text-xl text-red-600">Template not found!</div>;
  }

  return <EditTemplateClient template={template} />;
}