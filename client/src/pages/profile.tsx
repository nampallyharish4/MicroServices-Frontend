import { Layout } from "@/components/layout";
import { Button } from "@/components/button";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Profile() {
  const { data: user, isLoading } = useAuth();
  const { logout } = useLogout();

  if (isLoading) return <Layout><div className="h-[60vh] flex items-center justify-center">Loading...</div></Layout>;
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-24">
          <p className="mb-4">Please log in to view your profile.</p>
          <Link href="/login"><Button>Go to Login</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-12">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1 space-y-2">
            <Link href="/profile" className="block p-4 bg-muted font-bold uppercase tracking-wider text-sm">Profile Details</Link>
            <Link href="/orders" className="block p-4 border border-transparent hover:border-border hover:bg-muted/50 font-bold uppercase tracking-wider text-sm transition-all">Order History</Link>
            <button onClick={logout} className="w-full text-left p-4 text-destructive font-bold uppercase tracking-wider text-sm hover:bg-destructive/10 transition-colors">Sign Out</button>
          </div>
          
          <div className="md:col-span-2">
            <div className="border p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-8 pb-2 border-b">Account Details</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Name</p>
                  <p className="font-medium text-lg">{user.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Email</p>
                  <p className="font-medium text-lg">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
