export interface RivalReport {
  offensivePhase: string;
  defensivePhase: string;
  transitions: string;
  youtubeUrl: string;
}

export interface MatchPlan {
  googleSlidesUrl: string;
  youtubeUrl: string;
}

export interface MatchEvent {
  id: string;
  type: 'Gol a Favor' | 'Ocasión a Favor' | 'Gol en Contra' | 'Ocasión en Contra';
  timestamp: string; // Min:Sec format
}

export interface TeamInfo {
  name: string;
  logoUrl: string;
}

export interface MatchAnalysis {
  id: string;
  matchId: string;
  localTeam: TeamInfo;
  visitorTeam: TeamInfo;
  rivalReport: RivalReport;
  matchPlan: MatchPlan;
  events: MatchEvent[];
}
