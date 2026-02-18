import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: bigint;
    bowlingSkill: BowlingSkill;
    playingRole: PlayingRole;
    name: string;
    battingSkill: BattingSkill;
    team: string;
    fieldingSkill: FieldingSkill;
}
export interface LeaderboardEntry {
    userId: Principal;
    rank: bigint;
    totalPoints: bigint;
    teamId: bigint;
}
export interface TeamEntry {
    userId: Principal;
    team: FantasyTeam;
}
export interface PlayerWithPoints {
    playerId: bigint;
    points: bigint;
}
export interface FantasyTeam {
    playerIds: Array<bigint>;
    viceCaptainId: bigint;
    teamId: bigint;
    captainId: bigint;
}
export interface Match {
    id: bigint;
    team1: string;
    team2: string;
    isFinished: boolean;
    venue: string;
    date: string;
}
export interface Contest {
    isFinished: boolean;
    participants: Array<TeamEntry>;
    contestId: bigint;
    entryLimit?: bigint;
    matchId: bigint;
    prizePool: bigint;
}
export interface TeamSelectionInput {
    playerIds: Array<bigint>;
    viceCaptainId: bigint;
    captainId: bigint;
}
export interface UserProfile {
    name: string;
    avatar: string;
}
export enum BattingSkill {
    novice = "novice",
    internationalStar = "internationalStar",
    national = "national",
    amateur = "amateur",
    worldClass = "worldClass"
}
export enum FieldingSkill {
    learning = "learning",
    goldGlove = "goldGlove",
    average = "average",
    reliable = "reliable"
}
export enum PlayingRole {
    allRounder = "allRounder",
    bowler = "bowler",
    wicketKeeper = "wicketKeeper",
    batsman = "batsman"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPlayer(name: string, playingRole: PlayingRole, battingSkill: BattingSkill, bowlingSkill: BowlingSkill, fieldingSkill: FieldingSkill, team: string): Promise<Player>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createContestForMatch(matchId: bigint, prizePool: bigint, entryLimit: bigint | null): Promise<Contest>;
    createMatch(team1: string, team2: string, date: string, venue: string): Promise<Match>;
    finishMatch(matchId: bigint): Promise<void>;
    getAllMatches(): Promise<Array<Match>>;
    getAllPlayers(): Promise<Array<Player>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContest(contestId: bigint): Promise<Contest | null>;
    getContestLeaderboard(contestId: bigint): Promise<Array<LeaderboardEntry>>;
    getContestsForMatch(matchId: bigint): Promise<Array<Contest>>;
    getMatch(matchId: bigint): Promise<Match | null>;
    getMyContests(): Promise<Array<Contest>>;
    getMyTeams(): Promise<Array<FantasyTeam>>;
    getPlayer(playerId: bigint): Promise<Player | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinContest(contestId: bigint, teamId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selectTeamWithValidation(matchId: bigint, selection: TeamSelectionInput): Promise<FantasyTeam>;
    submitMatchPoints(matchId: bigint, points: Array<PlayerWithPoints>): Promise<void>;
}
