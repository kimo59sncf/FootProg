import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Volleyball, UserPlus } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{t("howItWorks.title")}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("howItWorks.step1.title")}</h3>
              <p className="text-gray-600">{t("howItWorks.step1.description")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("howItWorks.step2.title")}</h3>
              <p className="text-gray-600">{t("howItWorks.step2.description")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("howItWorks.step3.title")}</h3>
              <p className="text-gray-600">{t("howItWorks.step3.description")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("howItWorks.findMatches.title")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t("howItWorks.findMatches.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 overflow-hidden rounded-full mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1000"
                      alt="Trouve un match"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{t("howItWorks.findMatches.step1.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howItWorks.findMatches.step1.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                    <Volleyball className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{t("howItWorks.findMatches.step2.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howItWorks.findMatches.step2.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                    <UserPlus className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{t("howItWorks.findMatches.step3.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howItWorks.findMatches.step3.description")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                    <svg className="text-primary h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">{t("howItWorks.findMatches.step4.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howItWorks.findMatches.step4.description")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/find-matches">
              <Button size="lg">
                <Search className="mr-2 h-4 w-4" />
                {t("howItWorks.findMatches.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("howItWorks.createMatch.title")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t("howItWorks.createMatch.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex mb-6">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("howItWorks.createMatch.step1.title")}</h3>
                  <p className="text-gray-600">{t("howItWorks.createMatch.step1.description")}</p>
                </div>
              </div>
              
              <div className="flex mb-6">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("howItWorks.createMatch.step2.title")}</h3>
                  <p className="text-gray-600">{t("howItWorks.createMatch.step2.description")}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("howItWorks.createMatch.step3.title")}</h3>
                  <p className="text-gray-600">{t("howItWorks.createMatch.step3.description")}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">{t("howItWorks.createMatch.tips.title")}</h3>
              
              <ul className="space-y-4">
                <li className="flex">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("howItWorks.createMatch.tips.tip1")}</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("howItWorks.createMatch.tips.tip2")}</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("howItWorks.createMatch.tips.tip3")}</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{t("howItWorks.createMatch.tips.tip4")}</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <Link href="/create-match">
                  <Button className="w-full">
                    <Volleyball className="mr-2 h-4 w-4" />
                    {t("howItWorks.createMatch.cta")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("howItWorks.cta.title")}</h3>
              <p className="text-gray-600 mb-6">{t("howItWorks.cta.description")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("howItWorks.cta.register")}
                  </Button>
                </Link>
                <Link href="/find-matches">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t("howItWorks.cta.browse")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden relative">
                {/* We would use an actual image in production */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Volleyball className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("howItWorks.faq.title")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t("howItWorks.faq.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("howItWorks.faq.q1")}</h3>
              <p className="text-gray-600">{t("howItWorks.faq.a1")}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("howItWorks.faq.q2")}</h3>
              <p className="text-gray-600">{t("howItWorks.faq.a2")}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("howItWorks.faq.q3")}</h3>
              <p className="text-gray-600">{t("howItWorks.faq.a3")}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("howItWorks.faq.q4")}</h3>
              <p className="text-gray-600">{t("howItWorks.faq.a4")}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("howItWorks.faq.q5")}</h3>
              <p className="text-gray-600">{t("howItWorks.faq.a5")}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("howItWorks.faq.q6")}</h3>
              <p className="text-gray-600">{t("howItWorks.faq.a6")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
