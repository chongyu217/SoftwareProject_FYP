import { getDbData } from "@/lib/db";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const dbData = await getDbData();
  const settings = dbData?.settings || {};

  return <SettingsClient initialSettings={settings} />;
}
