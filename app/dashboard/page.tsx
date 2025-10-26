import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import dynamic from "next/dynamic";

const UserDashboard = dynamic(
  () =>
    import("@/components/dashboard/user-dashboard").then(
      (m) => m.UserDashboard
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-10 w-40 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-72 rounded-2xl skeleton" />
      </div>
    ),
    ssr: false,
  }
);

const UserInfo = dynamic(
  () => import("@/components/user-info").then((m) => m.UserInfo),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-48 rounded-2xl skeleton" />
        <div className="h-64 rounded-2xl skeleton" />
      </div>
    ),
    ssr: false,
  }
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6 sm:py-8 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <UserDashboard />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
