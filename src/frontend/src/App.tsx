import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import MatchDetailPage from './pages/MatchDetailPage';
import ContestsPage from './pages/ContestsPage';
import MyTeamsPage from './pages/MyTeamsPage';
import MyContestsPage from './pages/MyContestsPage';
import ContestDetailPage from './pages/ContestDetailPage';
import AdminPage from './pages/AdminPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const matchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/match/$matchId',
  component: MatchDetailPage,
});

const contestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/match/$matchId/contests',
  component: ContestsPage,
});

const myTeamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-teams',
  component: MyTeamsPage,
});

const myContestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-contests',
  component: MyContestsPage,
});

const contestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contest/$contestId',
  component: ContestDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  matchDetailRoute,
  contestsRoute,
  myTeamsRoute,
  myContestsRoute,
  contestDetailRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading FantasyXI...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
