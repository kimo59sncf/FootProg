import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface Match {
  id: number;
  title: string;
  date: string;
  duration: number;
  location: string;
  playersNeeded: number;
  playersTotal: number;
  fieldType: string;
  pricePerPlayer?: number;
  creatorId: number;
  currentParticipants?: number;
}

interface MatchCalendarProps {
  onMatchSelect?: (match: Match) => void;
  showExpiredMatches?: boolean;
}

export function MatchCalendar({ onMatchSelect, showExpiredMatches = false }: MatchCalendarProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'list'>('month');

  useEffect(() => {
    fetchMatches();
  }, [showExpiredMatches]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches');
      const data = await response.json();
      
      // Filtrer les matchs expirés si nécessaire
      const now = new Date();
      const filteredMatches = showExpiredMatches 
        ? data 
        : data.filter((match: Match) => new Date(match.date) >= now);
      
      setMatches(filteredMatches);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i);
      days.push({
        date: prevDay,
        isCurrentMonth: false,
        matches: []
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dayMatches = matches.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate.toDateString() === dayDate.toDateString();
      });
      
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        matches: dayMatches
      });
    }
    
    // Compléter avec les jours du mois suivant
    const totalCells = 42; // 6 semaines × 7 jours
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDay = new Date(year, month + 1, day);
      days.push({
        date: nextDay,
        isCurrentMonth: false,
        matches: []
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isExpired = (match: Match) => {
    return new Date(match.date) < new Date();
  };

  const isFull = (match: Match) => {
    return (match.currentParticipants || 0) >= match.playersTotal;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendrier des matchs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthYear = new Intl.DateTimeFormat('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(currentDate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendrier des matchs ({matches.length} match{matches.length !== 1 ? 's' : ''})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewType === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('month')}
              >
                Calendrier
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('list')}
              >
                Liste
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Légende */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Payant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Complet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded opacity-60"></div>
              <span>Expiré</span>
            </div>
          </div>

          {viewType === 'month' ? (
            <>
              {/* Navigation du calendrier */}
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold capitalize">{monthYear}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-1 border rounded-lg
                      ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/20'}
                      ${isToday(day.date) ? 'bg-primary/10 border-primary' : 'border-border'}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      ${isToday(day.date) ? 'text-primary font-bold' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {day.matches.slice(0, 2).map(match => (
                        <div
                          key={match.id}
                          className={`
                            text-xs p-1 rounded cursor-pointer truncate
                            ${match.fieldType === 'paid' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}
                            ${isExpired(match) ? 'opacity-50' : ''}
                            ${isFull(match) ? 'bg-red-100 text-red-800' : ''}
                          `}
                          onClick={() => setSelectedMatch(match)}
                          title={match.title}
                        >
                          {formatTime(new Date(match.date))} - {match.title}
                        </div>
                      ))}
                      {day.matches.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.matches.length - 2} autre{day.matches.length - 2 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Vue liste */
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {matches.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Aucun match disponible
                </div>
              ) : (
                matches.map(match => (
                  <Card 
                    key={match.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      isExpired(match) ? 'opacity-60' : ''
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{match.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDate(new Date(match.date))} à {formatTime(new Date(match.date))}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4" />
                              {match.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <UsersIcon className="h-4 w-4" />
                              {match.currentParticipants || 0}/{match.playersTotal}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={match.fieldType === 'paid' ? 'destructive' : 'default'}>
                            {match.fieldType === 'paid' ? 
                              `${match.pricePerPlayer}€` : 
                              'Gratuit'
                            }
                          </Badge>
                          {isExpired(match) && <Badge variant="secondary">Expiré</Badge>}
                          {isFull(match) && <Badge variant="destructive">Complet</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détails du match sélectionné */}
      {selectedMatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Détails du match</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedMatch(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedMatch.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(new Date(selectedMatch.date))} à {formatTime(new Date(selectedMatch.date))}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedMatch.duration} minutes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedMatch.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span>{selectedMatch.currentParticipants || 0}/{selectedMatch.playersTotal} joueurs</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={selectedMatch.fieldType === 'paid' ? 'destructive' : 'default'}>
                {selectedMatch.fieldType === 'paid' ? 
                  `Payant - ${selectedMatch.pricePerPlayer}€/joueur` : 
                  'Gratuit'
                }
              </Badge>
              
              {isExpired(selectedMatch) && (
                <Badge variant="secondary">Expiré</Badge>
              )}
              
              {isFull(selectedMatch) && (
                <Badge variant="destructive">Complet</Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (onMatchSelect) {
                    onMatchSelect(selectedMatch);
                  } else {
                    window.location.href = `/match/${selectedMatch.id}`;
                  }
                }}
                disabled={isExpired(selectedMatch)}
              >
                Voir détails
              </Button>
              
              {!isFull(selectedMatch) && !isExpired(selectedMatch) && (
                <Button variant="outline">
                  Rejoindre
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
