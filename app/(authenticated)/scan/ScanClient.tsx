"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Folder {
  id: string;
  name: string;
  webUrl: string;
}

export default function ScanClient() {
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch("/api/onedrive/folders");
        
        // Handle non-JSON responses (like 404 or redirects to HTML)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response from API:", text.substring(0, 500));
          throw new Error(`Server returned HTML instead of JSON (Status: ${res.status}). This often happens during session expiration or server errors.`);
        }

        const data = await res.json();
        
        if (!res.ok) {
          const errMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to load folders");
          throw new Error(errMsg);
        }
        
        setFolders(data.folders || []);
      } catch (err: any) {
        console.error("Fetch Folders Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFolders();
  }, []);

  const handleNext = () => {
    const selected = folders.find(f => f.id === selectedFolderId);
    if (selected) {
      sessionStorage.setItem("scanFolder", selected.name);
      sessionStorage.setItem("scanFolderId", selected.id);
      router.push("/template-selection");
    }
  };

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center uppercase tracking-widest">Selected Folder from OneDrive</h2>

      {/* Selection Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
         
         {/* Search Bar */}
         <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-2xl mx-auto">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search Folder..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
         </div>

         <div className="flex h-[500px]">
           {/* Tree/List View */}
           <div className="flex-1 border-r border-gray-100 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
              <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold text-sm uppercase tracking-widest">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
                 My OneDrive
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-400">Fetching folders...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center border border-red-100 shadow-inner">
                  <div className="text-4xl mb-4">🔓</div>
                  <p className="font-black uppercase tracking-widest text-lg mb-2">Connection Error</p>
                  <p className="text-sm mb-6 text-red-500/80 font-medium">{error}</p>
                  {error.toLowerCase().includes("unauthorized") && (
                    <Link 
                      href="/api/auth/signin"
                      className="inline-block px-8 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                    >
                      Sign In to OneDrive
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="space-y-1 ml-4 border-l border-gray-100 pl-4">
                  {filteredFolders.map((folder) => (
                     <li 
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        selectedFolderId === folder.id 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                          : "hover:bg-gray-50 text-gray-700 font-medium"
                      }`}
                     >
                       <div className="flex items-center gap-3">
                          <span className="text-xl">📁</span>
                          <span>{folder.name}</span>
                       </div>
                       <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedFolderId === folder.id ? 'opacity-100' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                     </li>
                  ))}
                  {filteredFolders.length === 0 && (
                    <div className="py-10 text-center text-gray-400 italic">No folders found matching "{searchQuery}"</div>
                  )}
                </ul>
              )}
           </div>

           {/* Detail Sidebar (Figure 7: Selected Path) */}
           <div className="w-80 bg-gray-50/30 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Selected Details</h4>
                
                {selectedFolder ? (
                  <div className="space-y-6">
                     <div>
                       <p className="text-gray-500 text-xs font-bold mb-1 uppercase">Name</p>
                       <p className="text-gray-900 font-bold text-lg leading-tight">{selectedFolder.name}</p>
                     </div>
                     <div>
                       <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-tighter">Selected Path:</p>
                       <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-700 font-mono text-xs break-all">
                         /OneDrive/{selectedFolder.name}
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                     <div className="text-4xl mb-4 opacity-20">📂</div>
                     <p className="text-gray-400 text-sm italic underline underline-offset-4 decoration-dotted">Select a folder to proceed</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedFolderId || isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all ${
                    selectedFolderId && !isLoading 
                      ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  Next Step
                </button>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
