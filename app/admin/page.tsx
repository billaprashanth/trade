import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin · Trade with Bunny",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
