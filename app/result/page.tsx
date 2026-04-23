"use client";

export default function ResultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Scan Result</h1>

        <p className="mb-2">❌ Missing file: report.pdf</p>
        <p className="mb-4">⚠ Wrong file name: doc1.txt</p>

        <button
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-3"
        >
          Fix Files
        </button>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}