import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Trophy, Users, ListChecks, Target, Shield } from 'lucide-react';
import AuthControls from './AuthControls';
import UserBadge from './UserBadge';

export default function AppLayout() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;

  const navItems = [
    { label: 'Matches', path: '/', icon: Trophy },
    { label: 'My Teams', path: '/my-teams', icon: Users, authRequired: true },
    { label: 'My Contests', path: '/my-contests', icon: ListChecks, authRequired: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <img
                src="/assets/generated/fantasyxi-logo.dim_512x512.png"
                alt="FantasyXI"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold tracking-tight">
                Fantasy<span className="text-primary">XI</span>
              </span>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.authRequired && !isAuthenticated) return null;
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  onClick={() => navigate({ to: '/admin' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === '/admin'
                      ? 'bg-destructive text-destructive-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              )}
            </nav>

            {/* Auth Controls */}
            <div className="flex items-center gap-4">
              {isAuthenticated && <UserBadge />}
              <AuthControls />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} FantasyXI. All rights reserved.</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
