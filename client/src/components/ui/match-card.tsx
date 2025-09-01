import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Match, User } from "@shared/schema";
import { CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MatchCardProps {
  match: Match & { 
    creator: User;
    currentParticipants?: number;
    availableSpots?: number;
  };
  participants?: { userId: number; status: string }[];
  onJoin?: (matchId: number) => void;
  joinLoading?: boolean;
  showBothButtons?: boolean; // Nouvelle prop pour afficher les deux boutons
}

export function MatchCard({ match, participants = [], onJoin, joinLoading, showBothButtons = false }: MatchCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "fr" ? fr : enUS;
  
  // Format date in current language
  const formattedDate = format(
    new Date(match.date), 
    "EEEE d MMMM", 
    { locale }
  );
  
  // Format time
  const formattedTime = format(
    new Date(match.date), 
    "HH:mm"
  );
  
  // Calculate end time
  const endTime = new Date(new Date(match.date).getTime() + match.duration * 60000);
  const formattedEndTime = format(endTime, "HH:mm");
  
  // Count confirmed participants
  const confirmedCount = match.currentParticipants ?? (participants.filter(p => p.status === "confirmed").length || 0);
  const availableSpots = match.availableSpots ?? (match.playersTotal - confirmedCount);
  const isFull = availableSpots <= 0;
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition duration-300 flex flex-col">
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Badge variant={match.fieldType === "free" ? "default" : "secondary"} className={match.fieldType === "free" ? "bg-primary" : "bg-accent"}>
            {match.fieldType === "free" ? t("match.freeField") : t("match.paidField")}
          </Badge>
        </div>
        
        <div className="h-48 relative overflow-hidden">
          <img
            src={match.fieldType === "free" 
              ? "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1000" 
              : "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?q=80&w=1000"}
            alt={match.fieldType === "free" ? "Terrain extérieur" : "Terrain en salle"}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className={`absolute bottom-4 right-4 bg-white bg-opacity-90 text-sm font-semibold px-3 py-1 rounded-full ${isFull ? 'text-red-600' : 'text-gray-800'}`}>
          {confirmedCount} / {match.playersTotal} {t("match.players")}
          {availableSpots > 0 && (
            <span className="text-green-600 ml-1">
              ({availableSpots} {t("match.spotsLeft", "spots left")})
            </span>
          )}
          {isFull && (
            <span className="text-red-600 ml-1 font-bold">
              {t("match.full", "FULL")}
            </span>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg">{match.title}</h3>
            <p className="text-gray-500 text-sm">{match.location}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {match.fieldType === "free" ? (
                <span className="text-primary">{t("match.free")}</span>
              ) : (
                <span className="text-accent">{match.pricePerPlayer}€ / {t("match.perPlayer")}</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formattedTime} - {formattedEndTime}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{match.complexName || match.location}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={match.creator.avatarUrl || undefined} alt={match.creator.username} />
              <AvatarFallback>{match.creator.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {t("match.organizedBy")} <span className="font-medium">{match.creator.firstName || match.creator.username}</span>
            </span>
          </div>
          
          {showBothButtons ? (
            <div className="flex gap-2">
              <Link href={`/match/${match.id}`}>
                <Button size="sm" variant="outline">{t("match.details")}</Button>
              </Link>
              {onJoin && (
                <Button 
                  size="sm" 
                  onClick={() => onJoin(match.id)}
                  variant="default" 
                  disabled={joinLoading || isFull}
                >
                  {joinLoading ? t("match.joining") : isFull ? t("match.full", "Full") : t("match.join")}
                </Button>
              )}
            </div>
          ) : onJoin ? (
            <Button 
              size="sm" 
              onClick={() => onJoin(match.id)}
              variant="default" 
              disabled={joinLoading || isFull}
            >
              {joinLoading ? t("match.joining") : isFull ? t("match.full", "Full") : t("match.join")}
            </Button>
          ) : (
            <Link href={`/match/${match.id}`}>
              <Button size="sm" variant="default">{t("match.details")}</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
