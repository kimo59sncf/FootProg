import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Match, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MatchCard } from "@/components/ui/match-card";
import { MatchFilter, MatchFilterValues } from "@/components/ui/match-filter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "@/components/ui/map-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MapPin, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FindMatches() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<MatchFilterValues>({});
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [joinMatchId, setJoinMatchId] = useState<number | null>(null);

  // Fetch matches
  const { data: matches, isLoading, refetch } = useQuery<(Match & { creator: User })[]>({
    queryKey: ["/api/matches", filters],
    queryFn: async ({ queryKey }) => {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      const filterValues = queryKey[1] as MatchFilterValues;
      
      if (filterValues.location) queryParams.append("location", filterValues.location);
      if (filterValues.date) queryParams.append("date", filterValues.date.toISOString());
      if (filterValues.fieldType) queryParams.append("fieldType", filterValues.fieldType);
      if (filterValues.spotsAvailable) queryParams.append("minSpots", filterValues.spotsAvailable);
      
      const url = `/api/matches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch matches");
      return response.json();
    },
  });

  // Join match mutation
  const joinMutation = useMutation({
    mutationFn: async (matchId: number) => {
      await apiRequest("POST", `/api/matches/${matchId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: t("match.joinSuccess"),
        description: t("match.joinSuccessMessage"),
      });
      setJoinMatchId(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("match.joinError"),
        description: error.message,
      });
      setJoinMatchId(null);
    },
  });

  const handleFilterChange = (values: MatchFilterValues) => {
    setFilters(values);
  };

  const handleJoinMatch = (matchId: number) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t("match.authRequired"),
        description: t("match.loginToJoin"),
      });
      return;
    }
    
    setJoinMatchId(matchId);
    joinMutation.mutate(matchId);
  };

  useEffect(() => {
    // Refetch when filters change
    refetch();
  }, [filters, refetch]);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t("findMatches.title")}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("findMatches.subtitle")}</p>
        </div>
        
        <MatchFilter onFilter={handleFilterChange} isLoading={isLoading} />
        
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {!isLoading && matches 
              ? t("findMatches.resultsCount", { count: matches.length }) 
              : t("findMatches.searching")}
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md flex items-center ${
                viewMode === "list" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <List className="h-4 w-4 mr-2" />
              {t("findMatches.listView")}
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-2 rounded-md flex items-center ${
                viewMode === "map" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {t("findMatches.mapView")}
            </button>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {viewMode === "list" ? (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">{t("common.loading")}</span>
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onJoin={handleJoinMatch}
                    joinLoading={joinMatchId === match.id && joinMutation.isPending}
                    showBothButtons={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="flex justify-center mb-4">
                  <MapPin className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("findMatches.noMatches")}</h3>
                <p className="text-gray-600">{t("findMatches.tryAdjusting")}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("findMatches.discoverMatches")}</h3>
              
              <div className="w-full h-96 relative">
                <MapView 
                  location={filters.location || t("findMatches.yourArea")} 
                  className="h-full"
                  matches={matches?.map(match => ({
                    id: match.id,
                    title: match.title,
                    coordinates: match.coordinates || undefined,
                    location: match.location
                  })) || []}
                />
                
                {/* Message d'information sur les marqueurs */}
                {!isLoading && matches && matches.length > 0 && (
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-600">
                      ⚽ {matches.length} {matches.length === 1 ? t("findMatches.matchFound") : t("findMatches.matchesFound")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}