import { useNavigate } from '@tanstack/react-router';
import { useGetMyContests } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyContestsPage() {
  const navigate = useNavigate();
  const { data: myContests, isLoading } = useGetMyContests();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Contests</h1>
          <p className="text-muted-foreground">Track your contest entries and rankings</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!myContests || myContests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Contests</h1>
          <p className="text-muted-foreground">Track your contest entries and rankings</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Contests Joined</CardTitle>
            <CardDescription>
              Join a contest to compete with other players and win prizes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Contests</h1>
        <p className="text-muted-foreground">Track your contest entries and rankings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {myContests.map((contest) => (
          <Card key={contest.contestId.toString()} className="hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Contest #{contest.contestId.toString()}
                </CardTitle>
                {contest.isFinished ? (
                  <Badge variant="secondary">Finished</Badge>
                ) : (
                  <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="h-4 w-4" />
                    Prize Pool
                  </div>
                  <p className="text-xl font-bold text-primary">{contest.prizePool.toString()}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Participants
                  </div>
                  <p className="text-xl font-bold">{contest.participants.length}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate({
                    to: '/contest/$contestId',
                    params: { contestId: contest.contestId.toString() },
                  })
                }
              >
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
