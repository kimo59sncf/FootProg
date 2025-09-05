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
      {/* Hero Section - Mobile First Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Mobile-First Layout */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            {/* Content Section */}
            <div className="flex-1 text-center lg:text-left">
              {/* Mobile Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 lg:mb-6">
                <Volleyball className="w-4 h-4 mr-2" />
                Application Mobile Optimisée
              </div>

              {/* Main Title - Mobile Optimized */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                {t("home.hero.title.start")}{" "}
                <span className="text-primary relative">
                  {t("home.hero.title.highlight")}
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full"></div>
                </span>{" "}
                {t("home.hero.title.end")}
              </h1>

              {/* Subtitle - Better mobile spacing */}
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t("home.hero.subtitle")}
              </p>

              {/* Mobile Stats */}
              <div className="flex justify-center lg:justify-start gap-6 sm:gap-8 mt-6 sm:mt-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">Matchs créés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-gray-600">Joueurs actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-gray-600">Terrains partenaires</div>
                </div>
              </div>

              {/* CTA Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/find-matches">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                    <Search className="mr-2 h-5 w-5" />
                    {t("home.hero.findMatch")}
                  </Button>
                </Link>
                <Link href="/create-match">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 hover:bg-primary hover:text-white transition-colors"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    {t("home.hero.createMatch")}
                  </Button>
                </Link>
              </div>

              {/* Mobile Trust Indicators */}
              <div className="flex justify-center lg:justify-start items-center gap-4 mt-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Sécurisé SSL
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  100% Gratuit
                </div>
              </div>
            </div>

            {/* Image Section - Mobile Optimized */}
            <div className="flex-1 relative">
              <div className="relative max-w-md mx-auto lg:max-w-none">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/football/hero-image.svg"
                    alt="Terrain de football - Application FootProg"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Floating Cards - Mobile Friendly */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100 max-w-[200px]">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">12 joueurs</div>
                      <div className="text-sm text-gray-600">rejoignent chaque heure</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100 max-w-[180px]">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Search className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">50+ terrains</div>
                      <div className="text-sm text-gray-600">dans toute la France</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Mobile Optimized */}
        <div className="mt-16 lg:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 mx-auto">
                <img
                  src="/images/football/search-icon.svg"
                  alt="Recherche de matchs de football"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">
                {t("home.features.find.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("home.features.find.description")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 mx-auto">
                <img
                  src="/images/football/organize-icon.svg"
                  alt="Organisation de matchs de football"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">
                {t("home.features.organize.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("home.features.organize.description")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 mx-auto">
                <img
                  src="/images/football/play-icon.svg"
                  alt="Jouer ensemble au football"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">
                {t("home.features.play.title")}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {t("home.features.play.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Matches Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              {t("home.matches.title")}
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              {t("home.matches.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeleton loaders while fetching data
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                >
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
              matches
                .slice(0, 3)
                .map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">{t("home.matches.noMatches")}</p>
                <Link href="/create-match">
                  <Button className="mt-4">
                    {t("home.matches.createFirst")}
                  </Button>
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

      {/* Call to Action - Mobile Enhanced */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Content Side */}
              <div className="flex-1 p-8 sm:p-10 lg:p-12">
                <div className="max-w-lg mx-auto lg:mx-0">
                  {/* Mobile Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Rejoignez la communauté
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                    {t("home.cta.title")}
                  </h3>

                  <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                    {t("home.cta.description")}
                  </p>

                  {/* Mobile Stats in CTA */}
                  <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">⭐ 4.8</div>
                      <div className="text-sm text-gray-600">Note moyenne</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-gray-600">Support</div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/auth" className="flex-1">
                      <Button size="lg" className="w-full shadow-lg hover:shadow-xl transition-shadow text-base sm:text-lg py-3 sm:py-4">
                        <UserPlus className="mr-2 h-5 w-5" />
                        {t("home.cta.register")}
                      </Button>
                    </Link>
                    <Link href="/how-it-works" className="flex-1">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-2 hover:bg-primary hover:text-white transition-colors text-base sm:text-lg py-3 sm:py-4"
                      >
                        <Search className="mr-2 h-5 w-5" />
                        {t("home.cta.learnMore")}
                      </Button>
                    </Link>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Vérifié par 1000+ utilisateurs
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Données sécurisées
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Side */}
              <div className="flex-1 relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                <img
                  src="/images/football/hero-image.svg"
                  alt="Rejoindre la communauté de football - FootProg"
                  className="w-full h-full object-cover"
                />
                {/* Overlay with testimonial */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-sm text-center">
                    <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
                    <p className="text-gray-800 font-medium mb-2">
                      "Super application pour trouver des partenaires de foot !"
                    </p>
                    <p className="text-gray-600 text-sm">- Jean D., Paris</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
