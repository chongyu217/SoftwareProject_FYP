import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDbData } from "@/lib/db";

export default async function Dashboard() {
  const session = await auth();
  const userName = session?.user?.name || "User";
  
  // Fetch data directly on the server
  const dbConfig = await getDbData() || { stats: { totalFoldersScanned: 0, lastScanDate: "None", recentScans: [] } };
  const { stats } = dbConfig;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome! {userName}</h2>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Start New Scan Action */}
        <Link 
          href="/scan"
          className="group bg-blue-600 rounded-2xl p-8 flex flex-col justify-between h-48 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center border border-blue-400 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-white text-2xl font-bold">Start New Scan</h3>
            <p className="text-blue-100 text-sm mt-1">Initiate a live folder analysis</p>
          </div>
        </Link>

        {/* Total Folders Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Total Folders Scanned</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-gray-900">{stats.totalFoldersScanned}</h3>
              <span className="text-gray-400 font-medium">Folders</span>
            </div>
          </div>
        </div>

        {/* Last Scan Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Last Scan Date</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.lastScanDate}</h3>
          </div>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Recent Scans</h3>
          <Link href="/report" className="text-blue-600 font-bold hover:underline text-sm uppercase tracking-widest">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-4">Folder</th>
                <th className="px-8 py-4">Template</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentScans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-400 italic">
                    No recent scans found. Start a new scan to see history.
                  </td>
                </tr>
              ) : (
                stats.recentScans.map((scan: any) => (
                  <tr key={scan.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                         <span className="text-xl">📁</span>
                         <span className="text-gray-900 font-bold">{scan.folder}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-gray-600 font-medium">{scan.template}</td>
                    <td className="px-8 py-5 text-gray-500 font-mono text-sm">{scan.date}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        scan.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Link 
                          href={`/report/details?id=${scan.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-blue-100 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}