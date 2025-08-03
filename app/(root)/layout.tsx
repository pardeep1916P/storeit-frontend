import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />

      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation 
          $id={currentUser.$id || currentUser.id}
          accountId={currentUser.accountId || currentUser.id}
          fullName={currentUser.username}
          avatar={currentUser.avatar || ''}
          email={currentUser.email}
        />
        <Header 
          userId={currentUser.$id || currentUser.id} 
          accountId={currentUser.accountId || currentUser.id}
          userEmail={currentUser.email}
          userName={currentUser.username}
        />
        <div className="main-content">{children}</div>
      </section>

      <Toaster />
    </main>
  );
};
export default Layout;
