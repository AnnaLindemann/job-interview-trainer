import { redirect } from "next/navigation";

import { auth } from "@/auth";
import HomePageClient from "@/components/home/home-page-client";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <HomePageClient />;
}