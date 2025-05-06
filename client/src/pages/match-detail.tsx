import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { MatchWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/ui/map-view";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Calendar, Clock, ChevronsRight, CheckCircle, MapPin, MessageCircle, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch match details
  const { data: match, isLoading, error } = useQuery<MatchWithDetails>({
    queryKey: [`/api/matches/${matchId}`],
    enabled: !isNaN(matchId),
  });

  // Check if user is participant
  const isParticipant = match?.participants.some(p => user && p.userId === user.id);
  const isCreator = match?.creatorId === user?.id;

  // Join match mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/matches/${matchId}/join`);
    },
    onSuccess: () => {
      toast({
        title: t("match.joinSuccess"),
        description: t("match.joinSuccessMessage"),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("match.joinError"),
        description: error.message,
      });
    },
  });

  // Leave match mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/matches/${matchId}/leave`);
    },
    onSuccess: () => {
      toast({
        title: t("match.leaveSuccess"),
        description: t("match.leaveSuccessMessage"),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("match.leaveError"),
        description: error.message,
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/matches/${matchId}/messages`, { content });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}`] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("match.messageSendError"),
        description: error.message,
      });
    },
  });

  const handleJoinMatch = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t("match.authRequired"),
        description: t("match.loginToJoin"),
      });
      setLocation("/auth");
      return;
    }
    
    joinMutation.mutate();
  };

  const handleLeaveMatch = () => {
    if (isCreator) {
      toast({
        variant: "destructive",
        title: t("match.cannotLeave"),
        description: t("match.creatorCannotLeave"),
      });
      return;
    }
    
    leaveMutation.mutate();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) {
      toast({
        variant: "destructive",
        title: t("match.authRequired"),
        description: t("match.loginToChat"),
      });
      return;
    }
    
    if (!isParticipant) {
      toast({
        variant: "destructive",
        title: t("match.participationRequired"),
        description: t("match.joinToChat"),
      });
      return;
    }
    
    sendMessageMutation.mutate(message.trim());
  };

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [match?.messages]);

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="w-full h-64" />
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <Skeleton className="h-10 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="flex items-center mt-4">
                    <Skeleton className="h-6 w-32 mr-6" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <Skeleton className="h-20 w-40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If error or match not found
  if (error || !match) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("match.notFound")}</h2>
            <p className="text-gray-600 mb-6">{t("match.notFoundDesc")}</p>
            <Link href="/find-matches">
              <Button>{t("match.browseMatches")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format match date and time
  const matchDate = new Date(match.date);
  const formattedDate = format(matchDate, "EEEE d MMMM yyyy", { locale: dateLocale });
  const formattedStartTime = format(matchDate, "HH:mm");
  const endTime = new Date(matchDate.getTime() + match.duration * 60000);
  const formattedEndTime = format(endTime, "HH:mm");

  // Calculate confirmed participants
  const confirmedParticipants = match.participants.filter(p => p.status === "confirmed");

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <div className="w-full h-64 md:h-80 bg-gray-200 relative">
              {/* We would use an actual image in production */}
              <img 
                src={match.fieldType === "free" 
                  ? "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000" 
                  : "https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=1000"}
                alt={match.fieldType === "free" ? "Terrain extérieur" : "Terrain en salle"}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute top-4 left-4">
              <Badge variant={match.fieldType === "free" ? "default" : "secondary"} className={match.fieldType === "free" ? "bg-primary" : "bg-accent"}>
                {match.fieldType === "free" ? t("match.freeField") : t("match.paidField")}
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{match.title}</h1>
                <p className="text-gray-600 mt-1">{match.location}</p>
                
                <div className="flex flex-wrap items-center mt-4 gap-y-2">
                  <div className="flex items-center mr-6">
                    <Calendar className="text-gray-500 mr-2 h-5 w-5" />
                    <span className="text-gray-700 capitalize">{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="text-gray-500 mr-2 h-5 w-5" />
                    <span className="text-gray-700">{formattedStartTime} - {formattedEndTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0">
                <div className={`border rounded-md px-4 py-3 text-center ${match.fieldType === "free" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                  <span className="block text-xl font-bold">
                    {match.fieldType === "free" ? (
                      <span className="text-green-600">{t("match.free")}</span>
                    ) : (
                      <span className="text-amber-600">{match.pricePerPlayer}€ / {t("match.perPlayer")}</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {match.fieldType === "free" ? t("match.municipalField") : match.complexName}
                  </span>
                </div>
                
                {isParticipant ? (
                  <Button 
                    variant="outline" 
                    className="mt-3 w-full" 
                    onClick={handleLeaveMatch}
                    disabled={isCreator || leaveMutation.isPending}
                  >
                    {leaveMutation.isPending ? t("match.leaving") : t("match.leaveMatch")}
                  </Button>
                ) : (
                  <Button 
                    className="mt-3 w-full" 
                    variant="accent"
                    onClick={handleJoinMatch}
                    disabled={joinMutation.isPending || confirmedParticipants.length >= match.playersTotal}
                  >
                    {joinMutation.isPending ? 
                      t("match.joining") : 
                      confirmedParticipants.length >= match.playersTotal ? 
                        t("match.full") : 
                        t("match.joinThisMatch")
                    }
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-medium text-lg text-gray-800 mb-3">{t("match.aboutThisMatch")}</h3>
                    <p className="text-gray-600">{match.additionalInfo || t("match.noAdditionalInfo")}</p>
                    
                    {match.fieldType === "paid" && match.complexUrl && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-800 mb-2">{t("match.complex")}</h4>
                        <p className="text-gray-600 mb-2">{match.complexName}</p>
                        <a 
                          href={match.complexUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary flex items-center hover:underline"
                        >
                          {t("match.visitWebsite")}
                          <ChevronsRight className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-800 mb-2">{t("match.practicalInfo")}</h4>
                      {match.additionalInfo ? (
                        // If we had structured data about amenities, we would display it here
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            <span>{t("match.bringSneakers")}</span>
                          </li>
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">{t("match.noInfoProvided")}</p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-800 mb-3">{t("map.location")}</h4>
                      <MapView 
                        location={match.location} 
                        coordinates={match.coordinates}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Tabs defaultValue="participants">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="participants">
                      {t("match.participants")}
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                      {t("match.chat")}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="participants">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex justify-between items-center">
                          <span>{t("match.participants")}</span>
                          <Badge variant="outline" className="ml-2">
                            {confirmedParticipants.length} / {match.playersTotal}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-0 max-h-80 overflow-y-auto divide-y divide-gray-100">
                          {match.participants.map((participant) => (
                            <div 
                              key={participant.id} 
                              className="flex items-center p-3 hover:bg-gray-50"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={participant.user.avatarUrl || undefined} alt={participant.user.username} />
                                <AvatarFallback>{participant.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-800">
                                  {participant.user.firstName || participant.user.username}
                                </span>
                                <span className="block text-xs text-gray-500">
                                  {participant.userId === match.creatorId ? t("match.organizer") : t("match.confirmed")}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Empty spots */}
                          {Array.from({ length: Math.max(0, match.playersTotal - confirmedParticipants.length) }).map((_, index) => (
                            <div 
                              key={`empty-${index}`} 
                              className="flex items-center p-3 text-gray-400 italic"
                            >
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                              <span className="text-sm">{t("match.availableSpot")}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="chat">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {t("match.discussion")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="bg-white rounded-md max-h-80 overflow-y-auto p-3">
                          <div className="space-y-4">
                            {match.messages.length === 0 ? (
                              <div className="text-center text-gray-500 py-10">
                                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>{t("match.noMessages")}</p>
                              </div>
                            ) : (
                              match.messages.map((message) => (
                                <div key={message.id} className="flex items-start">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={message.user.avatarUrl || undefined} alt={message.user.username} />
                                    <AvatarFallback>{message.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium text-sm text-gray-800">
                                        {message.user.firstName || message.user.username}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {format(new Date(message.createdAt), 'HH:mm')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                                  </div>
                                </div>
                              ))
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <form 
                          onSubmit={handleSendMessage}
                          className="flex p-3 pt-0"
                        >
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t("match.yourMessage")}
                            className="flex-grow rounded-r-none"
                            disabled={!user || !isParticipant || sendMessageMutation.isPending}
                          />
                          <Button 
                            type="submit"
                            className="rounded-l-none"
                            disabled={!message.trim() || !user || !isParticipant || sendMessageMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
