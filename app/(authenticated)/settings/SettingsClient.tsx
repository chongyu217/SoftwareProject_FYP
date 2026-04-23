"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/actions";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettingsAction(settings);
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-black mb-8">System Settings</h1>

        <div className="bg-white rounded-xl shadow border p-8">
          
          <h2 className="text-xl font-bold border-b pb-4 mb-6 text-black">Automation Preferences</h2>

          <div className="space-y-6">
            
            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Auto-Scan Frequency</label>
              <select 
                value={settings?.autoScanFrequency || "Daily"}
                onChange={(e) => setSettings({...settings, autoScanFrequency: e.target.value})}
                className="w-full max-w-md p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Manual">Manual Only</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">How often the system should passively check connected OneDrive folders for new files.</p>
            </div>

            {/* Notification Toggle */}
            <div className="flex items-center pt-4">
              <input 
                type="checkbox" 
                id="notify" 
                checked={settings?.notifyOnErrors || false}
                onChange={(e) => setSettings({...settings, notifyOnErrors: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <div className="ml-3">
                <label htmlFor="notify" className="text-sm font-semibold text-gray-700 cursor-pointer">Notify on Rules Violation</label>
                <p className="text-xs text-gray-500">Send an email alert if a scanned file breaks an active naming rule.</p>
              </div>
            </div>

            {/* Default Template */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Default Scanning Template</label>
              <input 
                type="text" 
                value={settings?.defaultTemplate || ""}
                onChange={(e) => setSettings({...settings, defaultTemplate: e.target.value})}
                className="w-full max-w-md p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="E.g., Project Template"
              />
            </div>

          </div>

          <div className="mt-10 pt-6 border-t flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-lg font-bold transition shadow-sm items-center flex justify-center ${isSaving ? 'bg-blue-400 text-white cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>

        </div>
    </div>
  );
}
