import { useGetMyTeams, useGetAllPlayers } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyTeamsPage() {
  const { data: myTeams, isLoading: teamsLoading } = useGetMyTeams();
  const { data: allPlayers, isLoading: playersLoading } = useGetAllPlayers();

  const isLoading = teamsLoading || playersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Teams</h1>
          <p className="text-muted-foreground">View and manage your fantasy teams</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!myTeams || myTeams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Teams</h1>
          <p className="text-muted-foreground">View and manage your fantasy teams</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Teams Yet</CardTitle>
            <CardDescription>
              Create your first team by selecting a match and building your squad.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Teams</h1>
        <p className="text-muted-foreground">View and manage your fantasy teams</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {myTeams.map((team) => {
          const captain = allPlayers?.find((p) => p.id === team.captainId);
          const viceCaptain = allPlayers?.find((p) => p.id === team.viceCaptainId);

          return (
            <Card key={team.teamId.toString()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team #{team.teamId.toString()}
                </CardTitle>
                <CardDescription>{team.playerIds.length} players</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {captain && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Star className="h-4 w-4 text-primary fill-current" />
                    <span className="text-sm font-medium">Captain: {captain.name}</span>
                  </div>
                )}
                {viceCaptain && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-accent">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Vice-Captain: {viceCaptain.name}</span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Players:</p>
                  <div className="flex flex-wrap gap-1">
                    {team.playerIds.map((playerId) => {
                      const player = allPlayers?.find((p) => p.id === playerId);
                      return (
                        <Badge key={playerId.toString()} variant="outline" className="text-xs">
                          {player?.name || `Player ${playerId.toString()}`}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
