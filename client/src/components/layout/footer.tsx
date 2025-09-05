import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Volleyball, Facebook, Twitter, Instagram } from "lucide-react";
import LanguageSwitcher from "./language-switcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div>
            <div className="flex items-center mb-4">
              <Volleyball className="text-primary text-3xl mr-2 h-8 w-8" />
              <span className="font-bold text-xl text-white">FootballConnect</span>
            </div>
            <p className="text-gray-300 mb-4">{t("footer.description")}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary transition">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/find-matches" className="text-gray-300 hover:text-primary transition">
                  {t("nav.findMatch")}
                </Link>
              </li>
              <li>
                <Link href="/create-match" className="text-gray-300 hover:text-primary transition">
                  {t("nav.createMatch")}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-primary transition">
                  {t("nav.howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-primary transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t("footer.information")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-primary transition">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-primary transition">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-primary transition">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-primary transition">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language and Developer Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t("footer.language")}</h3>
            <div className="mb-6">
              <LanguageSwitcher />
            </div>

            <h3 className="font-medium text-lg mt-6 mb-4">Contact Développeur</h3>
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">MK</span>
                </div>
                <div>
                  <div className="font-semibold text-white">MK-DEV</div>
                  <div className="text-gray-300 text-sm">Développeur Full-Stack</div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="mailto:karim.dev59@gmail.com"
                  className="flex items-center text-gray-300 hover:text-primary transition-colors"
                >
                  <span className="mr-2">📧</span>
                  karim.dev59@gmail.com
                </a>
                <a
                  href="tel:+33763349311"
                  className="flex items-center text-gray-300 hover:text-primary transition-colors"
                >
                  <span className="mr-2">📱</span>
                  07 63 34 93 11
                </a>
              </div>

              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400">
                  🚀 Passionné par le développement d'applications web innovantes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center space-y-2">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} FootballConnect. {t("footer.allRightsReserved")}
          </p>
          <p className="text-gray-500 text-sm">
            Développé avec ❤️ par <span className="text-primary font-medium">MK-DEV</span> | karim.dev59@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
