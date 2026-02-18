import { useNavigate } from '@tanstack/react-router';
import { useGetAllMatches } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: matches, isLoading, error } = useGetAllMatches();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/fantasyxi-hero-bg.dim_1600x900.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl px-4">
          <div className="mb-6">
            <img
              src="/assets/generated/fantasyxi-logo.dim_512x512.png"
              alt="FantasyXI"
              className="h-24 w-24 mx-auto mb-4"
            />
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-primary">FantasyXI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Build your dream team, join contests, and compete with players worldwide
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="gap-2 text-lg px-8" onClick={() => navigate({ to: '/' })}>
              <Trophy className="h-5 w-5" />
              Get Started
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: Users, title: 'Build Teams', desc: 'Select 11 players with strategic roles' },
              { icon: Trophy, title: 'Join Contests', desc: 'Compete for prizes in various contests' },
              { icon: Target, title: 'Win Rewards', desc: 'Top the leaderboard and claim victory' },
            ].map((feature, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upcoming Matches</h1>
          <p className="text-muted-foreground">Select a match to build your fantasy team</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Matches</CardTitle>
          <CardDescription>Failed to load matches. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Matches Available</CardTitle>
          <CardDescription>Check back soon for upcoming matches!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upcoming Matches</h1>
        <p className="text-muted-foreground">Select a match to build your fantasy team</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <Card
            key={match.id.toString()}
            className="hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => navigate({ to: '/match/$matchId', params: { matchId: match.id.toString() } })}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {match.team1} vs {match.team2}
                </CardTitle>
                {match.isFinished ? (
                  <Badge variant="secondary">Finished</Badge>
                ) : (
                  <Badge className="bg-primary/20 text-primary border-primary/30">Live</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {match.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {match.venue}
              </div>
              <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                View Match
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
    </svg>
  );
}
