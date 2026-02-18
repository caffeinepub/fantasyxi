import { useState } from 'react';
import { useGetAllMatches, useGetAllPlayers, useSubmitMatchPoints, useFinishMatch } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { PlayerWithPoints } from '../backend';

export default function AdminScoringForm() {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const { data: matches } = useGetAllMatches();
  const { data: allPlayers } = useGetAllPlayers();
  const submitPoints = useSubmitMatchPoints();
  const finishMatch = useFinishMatch();

  const [playerPoints, setPlayerPoints] = useState<Record<string, string>>({});

  const selectedMatch = matches?.find((m) => m.id.toString() === selectedMatchId);
  const matchPlayers = allPlayers?.filter(
    (p) => selectedMatch && (p.team === selectedMatch.team1 || p.team === selectedMatch.team2)
  ) || [];

  const handleFinishMatch = async () => {
    if (!selectedMatchId) {
      toast.error('Please select a match');
      return;
    }

    try {
      await finishMatch.mutateAsync(BigInt(selectedMatchId));
      toast.success('Match marked as finished!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to finish match');
    }
  };

  const handleSubmitPoints = async () => {
    if (!selectedMatchId) {
      toast.error('Please select a match');
      return;
    }

    const points: PlayerWithPoints[] = matchPlayers
      .filter((p) => playerPoints[p.id.toString()])
      .map((p) => ({
        playerId: p.id,
        points: BigInt(playerPoints[p.id.toString()] || '0'),
      }));

    if (points.length === 0) {
      toast.error('Please enter points for at least one player');
      return;
    }

    try {
      await submitPoints.mutateAsync({
        matchId: BigInt(selectedMatchId),
        points,
      });
      toast.success('Points submitted successfully!');
      setPlayerPoints({});
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit points');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Scoring</CardTitle>
        <CardDescription>Submit player points for a finished match</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="match">Select Match</Label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
            <SelectTrigger id="match">
              <SelectValue placeholder="Choose a match" />
            </SelectTrigger>
            <SelectContent>
              {matches?.map((match) => (
                <SelectItem key={match.id.toString()} value={match.id.toString()}>
                  {match.team1} vs {match.team2} - {match.date}
                  {match.isFinished && ' (Finished)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMatch && !selectedMatch.isFinished && (
          <Button onClick={handleFinishMatch} variant="outline" disabled={finishMatch.isPending}>
            {finishMatch.isPending ? 'Finishing...' : 'Mark Match as Finished'}
          </Button>
        )}

        {selectedMatch && selectedMatch.isFinished && matchPlayers.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Player Points</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  {matchPlayers.map((player) => (
                    <div key={player.id.toString()} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">{player.team}</p>
                      </div>
                      <Input
                        type="number"
                        placeholder="Points"
                        value={playerPoints[player.id.toString()] || ''}
                        onChange={(e) =>
                          setPlayerPoints((prev) => ({
                            ...prev,
                            [player.id.toString()]: e.target.value,
                          }))
                        }
                        className="w-24"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button onClick={handleSubmitPoints} className="w-full" disabled={submitPoints.isPending}>
              {submitPoints.isPending ? 'Submitting...' : 'Submit Points'}
            </Button>
          </>
        )}

        {selectedMatch && !selectedMatch.isFinished && (
          <p className="text-sm text-muted-foreground">
            Please mark the match as finished before submitting points.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
