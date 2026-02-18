import { useState } from 'react';
import { useCreateMatch, useAddPlayer, useCreateContest } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlayingRole, BattingSkill, FieldingSkill } from '../backend';

export default function AdminSeedPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CreateMatchForm />
      <AddPlayerForm />
      <CreateContestForm />
    </div>
  );
}

function CreateMatchForm() {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const createMatch = useCreateMatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMatch.mutateAsync({ team1, team2, date, venue });
      toast.success('Match created successfully!');
      setTeam1('');
      setTeam2('');
      setDate('');
      setVenue('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create match');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Match</CardTitle>
        <CardDescription>Add a new match to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team1">Team 1</Label>
            <Input
              id="team1"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              placeholder="e.g., India"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team2">Team 2</Label>
            <Input
              id="team2"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              placeholder="e.g., Australia"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g., 2026-03-15"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., Melbourne Cricket Ground"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={createMatch.isPending}>
            {createMatch.isPending ? 'Creating...' : 'Create Match'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddPlayerForm() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [role, setRole] = useState<PlayingRole>(PlayingRole.batsman);
  const [battingSkill, setBattingSkill] = useState<BattingSkill>(BattingSkill.national);
  const [bowlingSkill, setBowlingSkill] = useState<BattingSkill>(BattingSkill.national);
  const [fieldingSkill, setFieldingSkill] = useState<FieldingSkill>(FieldingSkill.average);
  const addPlayer = useAddPlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPlayer.mutateAsync({
        name,
        team,
        playingRole: role,
        battingSkill: battingSkill,
        bowlingSkill: bowlingSkill,
        fieldingSkill: fieldingSkill,
      });
      toast.success('Player added successfully!');
      setName('');
      setTeam('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add player');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Player</CardTitle>
        <CardDescription>Add a new player to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Virat Kohli"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerTeam">Team</Label>
            <Input
              id="playerTeam"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="e.g., India"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Playing Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as PlayingRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PlayingRole.batsman}>Batsman</SelectItem>
                <SelectItem value={PlayingRole.bowler}>Bowler</SelectItem>
                <SelectItem value={PlayingRole.allRounder}>All-Rounder</SelectItem>
                <SelectItem value={PlayingRole.wicketKeeper}>Wicket Keeper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="battingSkill">Batting Skill</Label>
            <Select value={battingSkill} onValueChange={(value) => setBattingSkill(value as BattingSkill)}>
              <SelectTrigger id="battingSkill">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BattingSkill.worldClass}>World Class</SelectItem>
                <SelectItem value={BattingSkill.internationalStar}>International Star</SelectItem>
                <SelectItem value={BattingSkill.national}>National</SelectItem>
                <SelectItem value={BattingSkill.amateur}>Amateur</SelectItem>
                <SelectItem value={BattingSkill.novice}>Novice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bowlingSkill">Bowling Skill</Label>
            <Select value={bowlingSkill} onValueChange={(value) => setBowlingSkill(value as BattingSkill)}>
              <SelectTrigger id="bowlingSkill">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BattingSkill.worldClass}>World Class</SelectItem>
                <SelectItem value={BattingSkill.internationalStar}>International Star</SelectItem>
                <SelectItem value={BattingSkill.national}>National</SelectItem>
                <SelectItem value={BattingSkill.amateur}>Amateur</SelectItem>
                <SelectItem value={BattingSkill.novice}>Novice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldingSkill">Fielding Skill</Label>
            <Select value={fieldingSkill} onValueChange={(value) => setFieldingSkill(value as FieldingSkill)}>
              <SelectTrigger id="fieldingSkill">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FieldingSkill.goldGlove}>Gold Glove</SelectItem>
                <SelectItem value={FieldingSkill.reliable}>Reliable</SelectItem>
                <SelectItem value={FieldingSkill.average}>Average</SelectItem>
                <SelectItem value={FieldingSkill.learning}>Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={addPlayer.isPending}>
            {addPlayer.isPending ? 'Adding...' : 'Add Player'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CreateContestForm() {
  const [matchId, setMatchId] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [entryLimit, setEntryLimit] = useState('');
  const createContest = useCreateContest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContest.mutateAsync({
        matchId: BigInt(matchId),
        prizePool: BigInt(prizePool),
        entryLimit: entryLimit ? BigInt(entryLimit) : null,
      });
      toast.success('Contest created successfully!');
      setMatchId('');
      setPrizePool('');
      setEntryLimit('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contest');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Contest</CardTitle>
        <CardDescription>Add a new contest for a match</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="matchId">Match ID</Label>
            <Input
              id="matchId"
              type="number"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              placeholder="e.g., 1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prizePool">Prize Pool</Label>
            <Input
              id="prizePool"
              type="number"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g., 10000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryLimit">Entry Limit (optional)</Label>
            <Input
              id="entryLimit"
              type="number"
              value={entryLimit}
              onChange={(e) => setEntryLimit(e.target.value)}
              placeholder="e.g., 100"
            />
          </div>
          <Button type="submit" className="w-full" disabled={createContest.isPending}>
            {createContest.isPending ? 'Creating...' : 'Create Contest'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
