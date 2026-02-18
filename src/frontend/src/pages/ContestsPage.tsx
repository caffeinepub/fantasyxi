import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMatch, useGetContestsForMatch } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import JoinContestDialog from '../components/JoinContestDialog';
import { useState } from 'react';

export default function ContestsPage() {
  const { matchId } = useParams({ from: '/match/$matchId/contests' });
  const navigate = useNavigate();
  const { data: match, isLoading: matchLoading } = useGetMatch(BigInt(matchId));
  const { data: contests, isLoading: contestsLoading } = useGetContestsForMatch(BigInt(matchId));
  const [selectedContestId, setSelectedContestId] = useState<bigint | null>(null);

  const isLoading = matchLoading || contestsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
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

  if (!match) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Match Not Found</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/match/$matchId', params: { matchId } })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Match
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">Contests</h1>
        <p className="text-muted-foreground">
          {match.team1} vs {match.team2}
        </p>
      </div>

      {!contests || contests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Contests Available</CardTitle>
            <CardDescription>Check back later for contests for this match.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contests.map((contest) => {
            const isFull = contest.entryLimit && contest.participants.length >= Number(contest.entryLimit);
            return (
              <Card key={contest.contestId.toString()} className="hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Contest #{contest.contestId.toString()}
                    </CardTitle>
                    {contest.isFinished ? (
                      <Badge variant="secondary">Finished</Badge>
                    ) : isFull ? (
                      <Badge variant="destructive">Full</Badge>
                    ) : (
                      <Badge className="bg-primary/20 text-primary border-primary/30">Open</Badge>
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
                      <p className="text-2xl font-bold text-primary">
                        {contest.prizePool.toString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Entries
                      </div>
                      <p className="text-2xl font-bold">
                        {contest.participants.length}
                        {contest.entryLimit && `/${contest.entryLimit.toString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedContestId(contest.contestId)}
                      disabled={contest.isFinished || isFull || match.isFinished}
                      className="flex-1"
                    >
                      {contest.isFinished
                        ? 'Finished'
                        : isFull
                        ? 'Full'
                        : match.isFinished
                        ? 'Match Locked'
                        : 'Join Contest'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate({
                          to: '/contest/$contestId',
                          params: { contestId: contest.contestId.toString() },
                        })
                      }
                    >
                      Leaderboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedContestId && (
        <JoinContestDialog
          contestId={selectedContestId}
          matchId={BigInt(matchId)}
          onClose={() => setSelectedContestId(null)}
        />
      )}
    </div>
  );
}
