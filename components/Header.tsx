import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Header() {
  const session = await auth();
  const userName = session?.user?.name || "User";
  const loginDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          {/* Mobile menu toggle could go here */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">File Automation System</h1>
      </div>

      <div className="flex items-center gap-6">
        {session ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-500 leading-none mb-1">Last Login</p>
              <p className="text-xs font-bold text-blue-600">{loginDate}</p>
            </div>

            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 overflow-hidden shadow-inner cursor-pointer hover:border-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        ) : (
          <Link 
            href="/api/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
