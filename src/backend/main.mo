import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type UserProfile = {
    name : Text;
    avatar : Text;
  };

  // Player representation
  public type Player = {
    id : Nat;
    name : Text;
    playingRole : PlayingRole;
    battingSkill : BattingSkill;
    bowlingSkill : BowlingSkill;
    fieldingSkill : FieldingSkill;
    team : Text;
  };

  public type Match = {
    id : Nat;
    team1 : Text;
    team2 : Text;
    date : Text;
    venue : Text;
    isFinished : Bool;
  };

  public type Contest = {
    contestId : Nat;
    matchId : Nat;
    entryLimit : ?Nat;
    participants : [TeamEntry];
    prizePool : Nat;
    isFinished : Bool;
  };

  public type FantasyTeam = {
    teamId : Nat;
    captainId : Nat;
    viceCaptainId : Nat;
    playerIds : [Nat];
  };

  type PlayingRole = {
    #batsman;
    #bowler;
    #allRounder;
    #wicketKeeper;
  };

  type BattingSkill = {
    #worldClass;
    #internationalStar;
    #national;
    #amateur;
    #novice;
  };

  type BowlingSkill = {
    #worldClass;
    #internationalStar;
    #national;
    #amateur;
    #novice;
  };

  type FieldingSkill = {
    #goldGlove;
    #reliable;
    #average;
    #learning;
  };

  public type PlayerWithPoints = {
    playerId : Nat;
    points : Nat;
  };

  public type TeamEntry = {
    userId : Principal;
    team : FantasyTeam;
  };

  public type TeamSelectionInput = {
    playerIds : [Nat];
    captainId : Nat;
    viceCaptainId : Nat;
  };

  public type LeaderboardEntry = {
    userId : Principal;
    teamId : Nat;
    totalPoints : Nat;
    rank : Nat;
  };

  var nextPlayerId = 1;
  var nextMatchId = 1;
  var nextContestId = 1;
  var nextTeamId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let players = Map.empty<Nat, Player>();
  let matches = Map.empty<Nat, Match>();
  let contests = Map.empty<Nat, Contest>();
  let userTeams = Map.empty<Principal, [FantasyTeam]>();
  let playerPointsMap = Map.empty<Nat, [PlayerWithPoints]>();

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ============ USER PROFILE FUNCTIONS ============

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ============ ADMIN FUNCTIONS ============

  // Add player (admin only)
  public shared ({ caller }) func addPlayer(
    name : Text,
    playingRole : PlayingRole,
    battingSkill : BattingSkill,
    bowlingSkill : BowlingSkill,
    fieldingSkill : FieldingSkill,
    team : Text,
  ) : async Player {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add players");
    };

    let player : Player = {
      id = nextPlayerId;
      name;
      playingRole;
      battingSkill;
      bowlingSkill;
      fieldingSkill;
      team;
    };
    players.add(nextPlayerId, player);
    nextPlayerId += 1;
    player;
  };

  // Create match (admin only)
  public shared ({ caller }) func createMatch(
    team1 : Text,
    team2 : Text,
    date : Text,
    venue : Text,
  ) : async Match {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create matches");
    };

    let match : Match = {
      id = nextMatchId;
      team1;
      team2;
      date;
      venue;
      isFinished = false;
    };
    matches.add(nextMatchId, match);
    nextMatchId += 1;
    match;
  };

  // Contest creation (admin only)
  public shared ({ caller }) func createContestForMatch(
    matchId : Nat,
    prizePool : Nat,
    entryLimit : ?Nat,
  ) : async Contest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create contests");
    };

    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?_match) {
        let contest : Contest = {
          contestId = nextContestId;
          matchId;
          entryLimit;
          participants = [];
          prizePool;
          isFinished = false;
        };
        contests.add(nextContestId, contest);
        nextContestId += 1;
        contest;
      };
    };
  };

  // Submit points for a finished match (admin only)
  public shared ({ caller }) func submitMatchPoints(
    matchId : Nat,
    points : [PlayerWithPoints],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can submit points");
    };

    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) {
        if (not match.isFinished) {
          Runtime.trap("Match must be marked as finished before submitting points");
        };
        playerPointsMap.add(matchId, points);
      };
    };
  };

  // Mark match as finished (admin only)
  public shared ({ caller }) func finishMatch(matchId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can finish matches");
    };

    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) {
        let updatedMatch : Match = {
          id = match.id;
          team1 = match.team1;
          team2 = match.team2;
          date = match.date;
          venue = match.venue;
          isFinished = true;
        };
        matches.add(matchId, updatedMatch);
      };
    };
  };

  // ============ USER FUNCTIONS ============

  // Team selection with role/skill validation (user only)
  public shared ({ caller }) func selectTeamWithValidation(
    matchId : Nat,
    selection : TeamSelectionInput,
  ) : async FantasyTeam {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can select teams");
    };

    // Validate match exists
    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) {
        if (match.isFinished) {
          Runtime.trap("Cannot select team for finished match");
        };
      };
    };

    // Validate player count
    if (selection.playerIds.size() != 11) {
      Runtime.trap("Team must have exactly 11 players");
    };

    // Validate all players exist
    for (playerId in selection.playerIds.vals()) {
      switch (players.get(playerId)) {
        case (null) { Runtime.trap("Player not found: " # playerId.toText()) };
        case (?_) {};
      };
    };

    // Validate captain and vice-captain are in the team
    var captainFound = false;
    var viceCaptainFound = false;
    for (playerId in selection.playerIds.vals()) {
      if (playerId == selection.captainId) { captainFound := true };
      if (playerId == selection.viceCaptainId) { viceCaptainFound := true };
    };

    if (not captainFound) {
      Runtime.trap("Captain must be selected from the team");
    };
    if (not viceCaptainFound) {
      Runtime.trap("Vice-captain must be selected from the team");
    };
    if (selection.captainId == selection.viceCaptainId) {
      Runtime.trap("Captain and vice-captain must be different players");
    };

    // Validate role constraints
    var batsmen = 0;
    var bowlers = 0;
    var allRounders = 0;
    var wicketKeepers = 0;

    for (playerId in selection.playerIds.vals()) {
      switch (players.get(playerId)) {
        case (?player) {
          switch (player.playingRole) {
            case (#batsman) { batsmen += 1 };
            case (#bowler) { bowlers += 1 };
            case (#allRounder) { allRounders += 1 };
            case (#wicketKeeper) { wicketKeepers += 1 };
          };
        };
        case (null) {};
      };
    };

    if (batsmen < 4) { Runtime.trap("At least 4 batsmen required") };
    if (bowlers < 4) { Runtime.trap("At least 4 bowlers required") };
    if (allRounders < 2) { Runtime.trap("At least 2 all-rounders required") };

    let fantasyTeam : FantasyTeam = {
      teamId = nextTeamId;
      playerIds = selection.playerIds;
      captainId = selection.captainId;
      viceCaptainId = selection.viceCaptainId;
    };

    switch (userTeams.get(caller)) {
      case (null) {
        userTeams.add(caller, [fantasyTeam]);
      };
      case (?teams) {
        let updatedTeams = teams.concat([fantasyTeam]);
        userTeams.add(caller, updatedTeams);
      };
    };

    nextTeamId += 1;
    fantasyTeam;
  };

  // Join contest with existing team (user only)
  public shared ({ caller }) func joinContest(contestId : Nat, teamId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join contests");
    };

    // Verify user owns the team
    var teamFound = false;
    var userTeam : ?FantasyTeam = null;

    switch (userTeams.get(caller)) {
      case (null) { Runtime.trap("No teams found for user") };
      case (?teams) {
        for (team in teams.vals()) {
          if (team.teamId == teamId) {
            teamFound := true;
            userTeam := ?team;
          };
        };
      };
    };

    if (not teamFound) {
      Runtime.trap("Team not found or not owned by user");
    };

    // Get contest and validate
    switch (contests.get(contestId)) {
      case (null) { Runtime.trap("Contest not found") };
      case (?contest) {
        if (contest.isFinished) {
          Runtime.trap("Contest is already finished");
        };

        // Check if user already joined
        for (entry in contest.participants.vals()) {
          if (entry.userId == caller) {
            Runtime.trap("User already joined this contest");
          };
        };

        // Check entry limit
        switch (contest.entryLimit) {
          case (?limit) {
            if (contest.participants.size() >= limit) {
              Runtime.trap("Contest is full");
            };
          };
          case (null) {};
        };

        // Add user to contest
        switch (userTeam) {
          case (?team) {
            let newEntry : TeamEntry = {
              userId = caller;
              team = team;
            };
            let updatedParticipants = contest.participants.concat([newEntry]);
            let updatedContest : Contest = {
              contestId = contest.contestId;
              matchId = contest.matchId;
              entryLimit = contest.entryLimit;
              participants = updatedParticipants;
              prizePool = contest.prizePool;
              isFinished = contest.isFinished;
            };
            contests.add(contestId, updatedContest);
          };
          case (null) { Runtime.trap("Team not found") };
        };
      };
    };
  };

  // ============ QUERY FUNCTIONS (accessible to all) ============

  public query func getAllPlayers() : async [Player] {
    players.values().toArray();
  };

  public query func getPlayer(playerId : Nat) : async ?Player {
    players.get(playerId);
  };

  public query func getAllMatches() : async [Match] {
    matches.values().toArray();
  };

  public query func getMatch(matchId : Nat) : async ?Match {
    matches.get(matchId);
  };

  public query func getContestsForMatch(matchId : Nat) : async [Contest] {
    let allContests = contests.values().toArray();
    allContests.filter<Contest>(func(c) { c.matchId == matchId });
  };

  public query func getContest(contestId : Nat) : async ?Contest {
    contests.get(contestId);
  };

  public query ({ caller }) func getMyTeams() : async [FantasyTeam] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their teams");
    };
    switch (userTeams.get(caller)) {
      case (null) { [] };
      case (?teams) { teams };
    };
  };

  public query ({ caller }) func getMyContests() : async [Contest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their contests");
    };
    let allContests = contests.values().toArray();
    allContests.filter<Contest>(
      func(contest) {
        contest.participants.find<TeamEntry>(
          func(entry) { entry.userId == caller },
        ) != null;
      },
    );
  };

  public query func getContestLeaderboard(contestId : Nat) : async [LeaderboardEntry] {
    switch (contests.get(contestId)) {
      case (null) { Runtime.trap("Contest not found") };
      case (?contest) {
        // Get match points
        let matchPoints = switch (playerPointsMap.get(contest.matchId)) {
          case (null) { [] };
          case (?points) { points };
        };

        // Calculate points for each participant
        var entries : [LeaderboardEntry] = [];
        for (participant in contest.participants.vals()) {
          let teamPoints = calculateTeamPoints(participant.team, matchPoints);
          let entry : LeaderboardEntry = {
            userId = participant.userId;
            teamId = participant.team.teamId;
            totalPoints = teamPoints;
            rank = 0; // Will be set after sorting
          };
          entries := entries.concat([entry]);
        };

        // Sort by points (descending)
        let sortedEntries = entries.sort(
          func(a, b) {
            if (a.totalPoints > b.totalPoints) { #less } else if (a.totalPoints < b.totalPoints) {
              #greater;
            } else { #equal };
          }
        );

        // Assign ranks
        var rankedEntries : [LeaderboardEntry] = [];
        var currentRank = 1;
        for (entry in sortedEntries.vals()) {
          let rankedEntry : LeaderboardEntry = {
            userId = entry.userId;
            teamId = entry.teamId;
            totalPoints = entry.totalPoints;
            rank = currentRank;
          };
          rankedEntries := rankedEntries.concat([rankedEntry]);
          currentRank += 1;
        };

        rankedEntries;
      };
    };
  };

  // ============ HELPER FUNCTIONS ============

  func calculateTeamPoints(team : FantasyTeam, matchPoints : [PlayerWithPoints]) : Nat {
    var totalPoints = 0;

    for (playerId in team.playerIds.vals()) {
      for (playerPoint in matchPoints.vals()) {
        if (playerPoint.playerId == playerId) {
          if (playerId == team.captainId) {
            totalPoints += playerPoint.points * 2; // Captain multiplier
          } else if (playerId == team.viceCaptainId) {
            totalPoints += (playerPoint.points * 3) / 2; // Vice-captain multiplier (1.5x)
          } else {
            totalPoints += playerPoint.points;
          };
        };
      };
    };

    totalPoints;
  };
};
