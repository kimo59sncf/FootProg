import React from 'react';
import { MatchCalendar } from '../components/ui/match-calendar';
import { useLocation } from 'wouter';

export function CalendarPage() {
  const [, setLocation] = useLocation();

  const handleMatchSelect = (match: any) => {
    setLocation(`/match/${match.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Calendrier des matchs
        </h1>
        <p className="text-muted-foreground">
          Visualisez tous les matchs disponibles dans un calendrier interactif
        </p>
      </div>
      
      <MatchCalendar 
        onMatchSelect={handleMatchSelect}
        showExpiredMatches={false}
      />
    </div>
  );
}
