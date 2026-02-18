import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuthInit } from '../hooks/useAuthInit';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthControls() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { initStatus } = useAuthInit();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in' || initStatus === 'initializing';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } else {
      try {
        login();
        // Don't show success toast here - it will be shown after successful login
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {loginStatus === 'logging-in' ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
