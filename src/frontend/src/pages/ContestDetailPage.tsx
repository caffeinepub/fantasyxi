import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetContest, useGetContestLeaderboard, useGetAllPlayers } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContestDetailPage() {
  const { contestId } = useParams({ from: '/contest/$contestId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: contest, isLoading: contestLoading } = useGetContest(BigInt(contestId));
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetContestLeaderboard(BigInt(contestId));
  const { data: allPlayers } = useGetAllPlayers();

  const isLoading = contestLoading || leaderboardLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!contest) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Contest Not Found</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const currentUserPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/my-contests' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to My Contests
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Contest #{contest.contestId.toString()}
              </CardTitle>
              <CardDescription>Prize Pool: {contest.prizePool.toString()} points</CardDescription>
            </div>
            {contest.isFinished ? (
              <Badge variant="secondary">Finished</Badge>
            ) : (
              <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>{contest.participants.length} participants</CardDescription>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No scores yet. Points will appear once the match is scored.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId.toString() === currentUserPrincipal;
                  const team = contest.participants.find(
                    (p) => p.userId.toString() === entry.userId.toString()
                  )?.team;
                  const captain = allPlayers?.find((p) => p.id === team?.captainId);

                  return (
                    <TableRow
                      key={entry.userId.toString()}
                      className={isCurrentUser ? 'bg-primary/5 border-primary/20' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.rank === 1n && <Trophy className="h-4 w-4 text-yellow-500" />}
                          {entry.rank === 2n && <Medal className="h-4 w-4 text-gray-400" />}
                          {entry.rank === 3n && <Award className="h-4 w-4 text-amber-600" />}
                          <span className="font-medium">#{entry.rank.toString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {entry.userId.toString().slice(0, 8)}...
                          </span>
                          {isCurrentUser && <Badge variant="outline">You</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">Team #{entry.teamId.toString()}</div>
                          {captain && (
                            <div className="text-xs text-muted-foreground">
                              Captain: {captain.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-bold text-primary">
                          {entry.totalPoints.toString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
