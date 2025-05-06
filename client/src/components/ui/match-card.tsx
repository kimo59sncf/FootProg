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
  match: Match & { creator: User };
  participants?: { userId: number; status: string }[];
  onJoin?: (matchId: number) => void;
  joinLoading?: boolean;
}

export function MatchCard({ match, participants = [], onJoin, joinLoading }: MatchCardProps) {
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
  const confirmedCount = participants.filter(p => p.status === "confirmed").length || 0;
  
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
              ? "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000" 
              : "https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=1000"}
            alt={match.fieldType === "free" ? "Terrain extérieur" : "Terrain en salle"}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
          {confirmedCount} / {match.playersTotal} {t("match.players")}
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
          
          {onJoin ? (
            <Button 
              size="sm" 
              onClick={() => onJoin(match.id)}
              variant="accent" 
              disabled={joinLoading}
            >
              {joinLoading ? t("match.joining") : t("match.join")}
            </Button>
          ) : (
            <Link href={`/match/${match.id}`}>
              <Button size="sm" variant="accent">{t("match.details")}</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
