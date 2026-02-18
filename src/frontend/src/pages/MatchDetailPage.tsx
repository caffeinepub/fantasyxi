import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMatch, useGetAllPlayers } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TeamBuilder from '../components/TeamBuilder';

export default function MatchDetailPage() {
  const { matchId } = useParams({ from: '/match/$matchId' });
  const navigate = useNavigate();
  const { data: match, isLoading: matchLoading } = useGetMatch(BigInt(matchId));
  const { data: allPlayers, isLoading: playersLoading } = useGetAllPlayers();

  const isLoading = matchLoading || playersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!match) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Match Not Found</CardTitle>
          <CardDescription>The match you're looking for doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/' })}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  const matchPlayers = allPlayers?.filter(
    (p) => p.team === match.team1 || p.team === match.team2
  ) || [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Matches
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                {match.team1} vs {match.team2}
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {match.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {match.venue}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {matchPlayers.length} Players Available
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {match.isFinished ? (
                <Badge variant="secondary">Finished</Badge>
              ) : (
                <Badge className="bg-primary/20 text-primary border-primary/30">Live</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() =>
              navigate({ to: '/match/$matchId/contests', params: { matchId: match.id.toString() } })
            }
            variant="outline"
            className="gap-2"
          >
            View Contests
          </Button>
        </CardContent>
      </Card>

      <TeamBuilder match={match} players={matchPlayers} />
    </div>
  );
}
