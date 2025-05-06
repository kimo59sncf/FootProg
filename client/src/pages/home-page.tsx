import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Match, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/ui/match-card";
import { Search, Volleyball, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { t } = useTranslation();
  
  const { data: matches, isLoading } = useQuery<(Match & { creator: User })[]>({
    queryKey: ["/api/matches"],
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
                {t("home.hero.title.start")} <span className="text-primary">{t("home.hero.title.highlight")}</span> {t("home.hero.title.end")}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/find-matches">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Search className="mr-2 h-5 w-5" />
                    {t("home.hero.findMatch")}
                  </Button>
                </Link>
                <Link href="/create-match">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t("home.hero.createMatch")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000" 
                  alt="Football field"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1000" 
                  alt="Search matches"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.find.title")}</h3>
              <p className="text-gray-600">{t("home.features.find.description")}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <Volleyball className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.organize.title")}</h3>
              <p className="text-gray-600">{t("home.features.organize.description")}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.play.title")}</h3>
              <p className="text-gray-600">{t("home.features.play.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Matches Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">{t("home.matches.title")}</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{t("home.matches.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeleton loaders while fetching data
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex flex-col gap-2 mt-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : matches && matches.length > 0 ? (
              matches.slice(0, 3).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">{t("home.matches.noMatches")}</p>
                <Link href="/create-match">
                  <Button className="mt-4">{t("home.matches.createFirst")}</Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Link href="/find-matches">
              <Button variant="link" className="text-primary">
                {t("home.matches.viewMore")} →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg p-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("home.cta.title")}</h3>
              <p className="text-gray-600 mb-6">{t("home.cta.description")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("home.cta.register")}
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t("home.cta.learnMore")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg overflow-hidden relative">
                {/* We would use an actual image in production */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Volleyball className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
