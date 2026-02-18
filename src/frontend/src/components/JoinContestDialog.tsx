import { useState } from 'react';
import { useGetMyTeams, useJoinContest } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface JoinContestDialogProps {
  contestId: bigint;
  matchId: bigint;
  onClose: () => void;
}

export default function JoinContestDialog({ contestId, matchId, onClose }: JoinContestDialogProps) {
  const { data: myTeams, isLoading } = useGetMyTeams();
  const joinContest = useJoinContest();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const handleJoin = async () => {
    if (!selectedTeamId) {
      toast.error('Please select a team');
      return;
    }

    try {
      await joinContest.mutateAsync({
        contestId,
        teamId: BigInt(selectedTeamId),
      });
      toast.success('Successfully joined contest!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join contest');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Team</DialogTitle>
          <DialogDescription>Choose a team to join this contest</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading your teams...</div>
        ) : !myTeams || myTeams.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any teams yet.</p>
            <Button onClick={onClose}>Create a Team First</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px] pr-4">
              <RadioGroup value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <div className="space-y-3">
                  {myTeams.map((team) => (
                    <div
                      key={team.teamId.toString()}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-all"
                    >
                      <RadioGroupItem value={team.teamId.toString()} id={team.teamId.toString()} />
                      <Label
                        htmlFor={team.teamId.toString()}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">Team #{team.teamId.toString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.playerIds.length} players
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={!selectedTeamId || joinContest.isPending}
                className="flex-1"
              >
                {joinContest.isPending ? 'Joining...' : 'Join Contest'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
