import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today · Plate",
  description: "Science-based meal planning cockpit",
};

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
