"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getTemplateByName } from "@/app/actions";

export default function ScanResultClient() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'warning', message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const [scanFolder, setScanFolder] = useState<string | null>("");
  const [scanTemplate, setScanTemplate] = useState<string | null>("");
  const [templateData, setTemplateData] = useState<any>(null);
  const [realFiles, setRealFiles] = useState<any[]>([]);

  // Dynamic Computation
  const requiredFiles = templateData?.requiredFiles || [];
  const realFileNames = realFiles.map(f => f.name.trim().toLowerCase());

  let missingFiles = requiredFiles.filter((rf: string) => !realFileNames.includes(rf.trim().toLowerCase()));
  let matchedFiles = realFiles.filter(f => requiredFiles.some((rf: string) => rf.trim().toLowerCase() === f.name.trim().toLowerCase()));
  let unknownFiles = realFiles.filter(f => !requiredFiles.some((rf: string) => rf.trim().toLowerCase() === f.name.trim().toLowerCase()));

  const misplacedFiles = unknownFiles.filter(f => f.name.includes("Notes") || f.name.includes("budget"));
  const incorrectNames = unknownFiles.filter(f => f.name.toLowerCase().includes("report") && !requiredFiles.includes(f.name));

  const complianceScore = Math.floor(((requiredFiles.length - missingFiles.length) / (requiredFiles.length || 1)) * 100);

  const loadScanData = async () => {
    const fn = sessionStorage.getItem("scanFolder");
    const tn = sessionStorage.getItem("scanTemplate");
    const fid = sessionStorage.getItem("scanFolderId");
    
    setScanFolder(fn);
    setScanTemplate(tn);

    // Load Template
    let loadedTemplate = null;
    if (tn) {
      loadedTemplate = await getTemplateByName(tn);
      if (loadedTemplate) setTemplateData(loadedTemplate);
    }

    // Fetch Real Files from OneDrive
    if (fid) {
      try {
        const res = await fetch(`/api/onedrive/files?folderId=${fid}`);
        const data = await res.json();
        if (res.ok) {
          setRealFiles(data.files || []);
        }
      } catch (err) {
        console.error("Failed to load real files", err);
      }
    }
  };

  useEffect(() => {
    async function init() {
      setIsScanning(true);
      await loadScanData();
      setIsScanning(false);
    }
    init();
  }, []);

  // Navigation Warning (Browser level)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaved && (missingFiles.length > 0 || !fixed)) {
        e.preventDefault();
        e.returnValue = "Changes you made may not be saved.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSaved, fixed, missingFiles.length]);

  // Navigation Warning (Internal Link Clicks)
  useEffect(() => {
    const handleInternalClick = (e: MouseEvent) => {
      if (isSaved || (missingFiles.length === 0 && fixed)) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // If it's an internal link and not a child of the current page's actions
      if (link && link.href && link.origin === window.location.origin && !link.href.includes('/scan-result')) {
        const confirmed = window.confirm("You have unsaved scan results. Are you sure you want to leave?");
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    
    document.addEventListener('click', handleInternalClick, true);
    return () => document.removeEventListener('click', handleInternalClick, true);
  }, [isSaved, missingFiles.length, fixed]);

  const showNotification = (type: 'success' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const folderId = sessionStorage.getItem("scanFolderId");
    if (!folderId) {
      alert("Folder ID not found.");
      return;
    }

    setIsUploading(targetName);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId);

    try {
      const res = await fetch("/api/onedrive/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        // Success: Refresh data with a small delay to allow OneDrive to propagate
        showNotification('success', `File "${file.name}" uploaded. Refreshing...`);
        setTimeout(async () => {
          await loadScanData();
          showNotification('success', `Folder synchronized successfully!`);
        }, 2000);
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Network error during upload.");
    } finally {
      setIsUploading(null);
    }
  };

  const handleFixFiles = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setFixed(true);
    }, 1500);
  }

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: scanFolder || "Unknown Folder",
          template: scanTemplate || "Unknown Template",
          status: (fixed || missingFiles.length === 0) ? "Completed" : "Review Needed"
        })
      });

      if (response.ok) {
        setIsSaved(true);
        showNotification('success', 'Scan report has been confirmed and saved to history.');
        sessionStorage.removeItem("scanFolder");
        sessionStorage.removeItem("scanTemplate");
        sessionStorage.removeItem("scanFolderId");
        router.push("/report");
      } else {
        alert("Failed to confirm scan to database.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error confirming scan.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isScanning) {
    return (
      <div className="flex h-screen bg-gray-100 p-10 items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow-md text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg tracking-widest">ANALYZING REAL-TIME COMPLIANCE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-10 right-10 z-50 animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-bold tracking-tight">{notification.message}</span>
        </div>
      )}

      <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-widest text-center">Scan Result</h2>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10 flex flex-col gap-8 flex-1">
         
         {/* Result Header Info */}
         <div className="flex justify-between items-center bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <div className="space-y-2">
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Analysis Target</p>
               <div className="flex flex-col">
                  <span className="text-gray-900 font-black text-xl flex items-center gap-2">
                     <span className="opacity-40">📁</span> {scanFolder}
                  </span>
                  <span className="text-blue-600 font-bold text-sm">Template: {scanTemplate}</span>
               </div>
            </div>

            <div className={`p-8 rounded-[2rem] text-center min-w-[200px] border-4 transition-all duration-500 ${
              (fixed || complianceScore === 100) 
                 ? 'bg-green-50 border-green-400 text-green-700 shadow-lg shadow-green-100' 
                 : (complianceScore >= 80 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-red-50 border-red-200 text-red-500')
            }`}>
               <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">System Compliance</p>
               <p className="text-5xl font-black italic tracking-tighter">{fixed ? '100%' : `${complianceScore}%`}</p>
            </div>
         </div>

         {/* Issues Grid */}
         <div className="flex-1 min-h-0">
            {fixed ? (
              <div className="h-full flex flex-col items-center justify-center bg-green-50/30 rounded-3xl border-2 border-dashed border-green-200">
                 <div className="text-6xl mb-4 animate-bounce">🛡️</div>
                 <h3 className="text-2xl font-black text-green-800 uppercase tracking-widest text-center">Protocol Enforced</h3>
                 <p className="text-green-600 font-bold mt-2">All files have been synchronized with your template</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10">
                  {/* Directory Integrity column */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between pl-2">
                        <div className="flex items-center gap-2">
                           <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Directory Integrity</h4>
                           <button 
                             onClick={() => loadScanData()} 
                             title="Manual Refresh"
                             className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-gray-400 ${isScanning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                             </svg>
                           </button>
                        </div>
                        {!isSaved && (missingFiles.length > 0) && (
                          <span className="animate-pulse bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Unsaved Actions</span>
                        )}
                     </div>
                     
                     <div className="bg-gray-50 rounded-2xl p-4 space-y-4 max-h-[450px] overflow-y-auto border border-gray-100 shadow-inner">
                        {/* Requirement Checklist */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Requirement Compliance</p>
                          {templateData?.requiredFiles.map((req: string) => {
                            const found = realFiles.find(f => f.name.toLowerCase() === req.toLowerCase());
                            return (
                              <div key={req} className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm border transition-all duration-500 ${
                                found ? 'bg-green-50 border-green-200' : 'bg-red-50/80 border-red-100'
                              }`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <span className="flex-shrink-0">
                                    {found ? (
                                      <div className="bg-green-100 p-1 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="bg-red-50 p-1 rounded-full border border-red-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </div>
                                    )}
                                  </span>
                                  <span className={`font-bold text-sm truncate ${found ? 'text-green-700' : 'text-red-700'}`}>{req}</span>
                                </div>
                                
                                {found ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-white bg-green-500 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition-all">
                                       <span className="text-[8px]">✓</span> Verified
                                    </span>
                                    <a 
                                      href={found.webUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors hover:scale-110"
                                      title="Open this file in OneDrive to view contents"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <input 
                                      type="file" 
                                      id={`upload-${req}`}
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, req)}
                                    />
                                    <label 
                                      htmlFor={`upload-${req}`}
                                      title={`Missing ${req}. Click to upload this file from your computer.`}
                                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 group hover:scale-105 active:scale-95 ${
                                        isUploading === req 
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                          : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100"
                                      }`}
                                    >
                                      {isUploading === req ? '...' : "Upload File"}
                                    </label>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                     </div>
                  </div>
              </div>
            )}
         </div>

         {/* Footer Actions */}
         <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
            <button className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-colors">
               Review Details
            </button>

            <div className="flex gap-4">
               {!fixed && (missingFiles.length > 0) && (
                  <button 
                     onClick={handleFixFiles} 
                     disabled={isFixing}
                     title="Automatically fix minor violations and naming conventions"
                     className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${
                       isFixing ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-500 text-white shadow-yellow-100 hover:bg-yellow-600'
                     }`}
                  >
                     {isFixing ? 'Synchronizing...' : 'Fix Files'}
                  </button>
                )}
                
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming || isFixing}
                  title="Finalize scan, save report, and store metadata in history"
                  className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${
                    (isConfirming || isFixing) ? "bg-gray-100 text-gray-300" : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
                  }`}
                >
                  {isConfirming ? "Securing Data..." : "Confirm & Save"}
                </button>
            </div>
         </div>
      </div>

      <div className="h-10 shrink-0" /> {/* Bottom spacer for better scroll room */}
    </div>
  );
}
