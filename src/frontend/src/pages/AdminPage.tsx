import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import AccessDenied from '../components/AccessDenied';
import AdminSeedPanel from '../components/AdminSeedPanel';
import AdminScoringForm from '../components/AdminScoringForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  // Don't check admin status for guests
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage matches, players, contests, and scoring</p>
        </div>
      </div>

      <Tabs defaultValue="seed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="seed">Seed Data</TabsTrigger>
          <TabsTrigger value="scoring">Match Scoring</TabsTrigger>
        </TabsList>

        <TabsContent value="seed">
          <AdminSeedPanel />
        </TabsContent>

        <TabsContent value="scoring">
          <AdminScoringForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
