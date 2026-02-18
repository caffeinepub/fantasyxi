import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  UserProfile,
  Match,
  Player,
  Contest,
  FantasyTeam,
  TeamSelectionInput,
  LeaderboardEntry,
  PlayerWithPoints,
  PlayingRole,
  BattingSkill,
  FieldingSkill,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && isAuthenticated && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

// Match Queries
export function useGetAllMatches() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMatches();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetMatch(matchId: bigint) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Match | null>({
    queryKey: ['match', matchId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMatch(matchId);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useCreateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { team1: string; team2: string; date: string; venue: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMatch(params.team1, params.team2, params.date, params.venue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useFinishMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.finishMatch(matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Player Queries
export function useGetAllPlayers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlayers();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useAddPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      team: string;
      playingRole: PlayingRole;
      battingSkill: BattingSkill;
      bowlingSkill: BattingSkill;
      fieldingSkill: FieldingSkill;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPlayer(
        params.name,
        params.playingRole,
        params.battingSkill,
        params.bowlingSkill,
        params.fieldingSkill,
        params.team
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

// Team Queries
export function useGetMyTeams() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<FantasyTeam[]>({
    queryKey: ['myTeams'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTeams();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSelectTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { matchId: bigint; selection: TeamSelectionInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.selectTeamWithValidation(params.matchId, params.selection);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
  });
}

// Contest Queries
export function useGetContestsForMatch(matchId: bigint) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Contest[]>({
    queryKey: ['contests', matchId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContestsForMatch(matchId);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetContest(contestId: bigint) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Contest | null>({
    queryKey: ['contest', contestId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getContest(contestId);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetMyContests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Contest[]>({
    queryKey: ['myContests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyContests();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useCreateContest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { matchId: bigint; prizePool: bigint; entryLimit: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createContestForMatch(params.matchId, params.prizePool, params.entryLimit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useJoinContest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { contestId: bigint; teamId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinContest(params.contestId, params.teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['myContests'] });
    },
  });
}

// Leaderboard Queries
export function useGetContestLeaderboard(contestId: bigint) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', contestId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContestLeaderboard(contestId);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });
}

// Scoring Mutations
export function useSubmitMatchPoints() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { matchId: bigint; points: PlayerWithPoints[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitMatchPoints(params.matchId, params.points);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
