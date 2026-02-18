import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export default function UserBadge() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading || !userProfile) {
    return null;
  }

  const initials = userProfile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {userProfile.avatar || initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium hidden sm:inline">{userProfile.name}</span>
    </div>
  );
}
