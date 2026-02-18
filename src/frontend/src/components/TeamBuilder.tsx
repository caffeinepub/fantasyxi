import { useState, useMemo } from 'react';
import { useSelectTeam } from '../hooks/useQueries';
import type { Match, Player } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Users, Star, Shield } from 'lucide-react';

interface TeamBuilderProps {
  match: Match;
  players: Player[];
}

const roleLabels = {
  batsman: 'Batsman',
  bowler: 'Bowler',
  allRounder: 'All-Rounder',
  wicketKeeper: 'Wicket Keeper',
};

export default function TeamBuilder({ match, players }: TeamBuilderProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<bigint[]>([]);
  const [captainId, setCaptainId] = useState<bigint | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<bigint | null>(null);
  const selectTeam = useSelectTeam();

  const isLocked = match.isFinished;

  const togglePlayer = (playerId: bigint) => {
    if (isLocked) return;

    setSelectedPlayerIds((prev) => {
      const exists = prev.some((id) => id === playerId);
      if (exists) {
        // Remove player
        if (captainId === playerId) setCaptainId(null);
        if (viceCaptainId === playerId) setViceCaptainId(null);
        return prev.filter((id) => id !== playerId);
      } else {
        // Add player
        if (prev.length >= 11) {
          toast.error('Maximum 11 players allowed');
          return prev;
        }
        return [...prev, playerId];
      }
    });
  };

  const setCaptain = (playerId: bigint) => {
    if (isLocked) return;
    if (!selectedPlayerIds.some((id) => id === playerId)) {
      toast.error('Player must be in your team');
      return;
    }
    if (viceCaptainId === playerId) {
      setViceCaptainId(null);
    }
    setCaptainId(playerId);
  };

  const setViceCaptain = (playerId: bigint) => {
    if (isLocked) return;
    if (!selectedPlayerIds.some((id) => id === playerId)) {
      toast.error('Player must be in your team');
      return;
    }
    if (captainId === playerId) {
      setCaptainId(null);
    }
    setViceCaptainId(playerId);
  };

  const roleCounts = useMemo(() => {
    const counts = { batsman: 0, bowler: 0, allRounder: 0, wicketKeeper: 0 };
    selectedPlayerIds.forEach((id) => {
      const player = players.find((p) => p.id === id);
      if (player) {
        const role = Object.keys(player.playingRole)[0] as keyof typeof counts;
        counts[role]++;
      }
    });
    return counts;
  }, [selectedPlayerIds, players]);

  const handleSaveTeam = async () => {
    if (selectedPlayerIds.length !== 11) {
      toast.error('Please select exactly 11 players');
      return;
    }
    if (!captainId) {
      toast.error('Please select a captain');
      return;
    }
    if (!viceCaptainId) {
      toast.error('Please select a vice-captain');
      return;
    }

    try {
      await selectTeam.mutateAsync({
        matchId: match.id,
        selection: {
          playerIds: selectedPlayerIds,
          captainId,
          viceCaptainId,
        },
      });
      toast.success('Team saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save team');
    }
  };

  const team1Players = players.filter((p) => p.team === match.team1);
  const team2Players = players.filter((p) => p.team === match.team2);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Player Selection */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Your Team</CardTitle>
            <CardDescription>
              Choose 11 players: Min 4 batsmen, 4 bowlers, 2 all-rounders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={match.team1}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={match.team1}>{match.team1}</TabsTrigger>
                <TabsTrigger value={match.team2}>{match.team2}</TabsTrigger>
              </TabsList>
              <TabsContent value={match.team1}>
                <PlayerList
                  players={team1Players}
                  selectedPlayerIds={selectedPlayerIds}
                  captainId={captainId}
                  viceCaptainId={viceCaptainId}
                  onToggle={togglePlayer}
                  onSetCaptain={setCaptain}
                  onSetViceCaptain={setViceCaptain}
                  isLocked={isLocked}
                />
              </TabsContent>
              <TabsContent value={match.team2}>
                <PlayerList
                  players={team2Players}
                  selectedPlayerIds={selectedPlayerIds}
                  captainId={captainId}
                  viceCaptainId={viceCaptainId}
                  onToggle={togglePlayer}
                  onSetCaptain={setCaptain}
                  onSetViceCaptain={setViceCaptain}
                  isLocked={isLocked}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Team Summary */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Team ({selectedPlayerIds.length}/11)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Batsmen:</span>
                <Badge variant={roleCounts.batsman >= 4 ? 'default' : 'secondary'}>
                  {roleCounts.batsman}/4+
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bowlers:</span>
                <Badge variant={roleCounts.bowler >= 4 ? 'default' : 'secondary'}>
                  {roleCounts.bowler}/4+
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>All-Rounders:</span>
                <Badge variant={roleCounts.allRounder >= 2 ? 'default' : 'secondary'}>
                  {roleCounts.allRounder}/2+
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Wicket Keepers:</span>
                <Badge variant="secondary">{roleCounts.wicketKeeper}</Badge>
              </div>
            </div>

            {captainId && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  Captain: {players.find((p) => p.id === captainId)?.name}
                </div>
              </div>
            )}

            {viceCaptainId && (
              <div className="p-3 rounded-lg bg-accent">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Vice-Captain: {players.find((p) => p.id === viceCaptainId)?.name}
                </div>
              </div>
            )}

            <Button
              onClick={handleSaveTeam}
              disabled={selectTeam.isPending || isLocked}
              className="w-full"
            >
              {selectTeam.isPending ? 'Saving...' : isLocked ? 'Match Locked' : 'Save Team'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PlayerListProps {
  players: Player[];
  selectedPlayerIds: bigint[];
  captainId: bigint | null;
  viceCaptainId: bigint | null;
  onToggle: (id: bigint) => void;
  onSetCaptain: (id: bigint) => void;
  onSetViceCaptain: (id: bigint) => void;
  isLocked: boolean;
}

function PlayerList({
  players,
  selectedPlayerIds,
  captainId,
  viceCaptainId,
  onToggle,
  onSetCaptain,
  onSetViceCaptain,
  isLocked,
}: PlayerListProps) {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-2">
        {players.map((player) => {
          const isSelected = selectedPlayerIds.some((id) => id === player.id);
          const isCaptain = captainId === player.id;
          const isViceCaptain = viceCaptainId === player.id;
          const role = Object.keys(player.playingRole)[0] as keyof typeof roleLabels;

          return (
            <div
              key={player.id.toString()}
              className={`p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle(player.id)}
                  disabled={isLocked}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{player.name}</h4>
                    {isCaptain && (
                      <Badge className="bg-primary text-primary-foreground">C</Badge>
                    )}
                    {isViceCaptain && <Badge variant="secondary">VC</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{roleLabels[role]}</Badge>
                    <span>{player.team}</span>
                  </div>
                </div>
                {isSelected && !isLocked && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={isCaptain ? 'default' : 'outline'}
                      onClick={() => onSetCaptain(player.id)}
                      className="h-7 px-2"
                    >
                      C
                    </Button>
                    <Button
                      size="sm"
                      variant={isViceCaptain ? 'default' : 'outline'}
                      onClick={() => onSetViceCaptain(player.id)}
                      className="h-7 px-2"
                    >
                      VC
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
