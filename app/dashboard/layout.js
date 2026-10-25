
import { Suspense } from "react";
import Sidebar from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <aside className="w-64 shrink-0 border-r bg-white p-5">
            <h1 className="text-2xl font-bold">TaskMan</h1>
          </aside>
        }
      >
        <Sidebar />
      </Suspense>

      <main className="min-w-0 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
