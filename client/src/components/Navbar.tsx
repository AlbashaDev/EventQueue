import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Lock, LogOut, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/StockholmsStad_logotypeStandardA4_300ppi_svart.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = "en" | "sv";

// Simple translations for the navbar
const translations = {
  queueDisplay: {
    en: "Queue Display",
    sv: "Kövisning"
  },
  adminPanel: {
    en: "Admin Panel",
    sv: "Adminpanel"
  },
  logout: {
    en: "Logout",
    sv: "Logga ut"
  },
  language: {
    en: "Language",
    sv: "Språk"
  },
  english: {
    en: "English",
    sv: "Engelska"
  },
  swedish: {
    en: "Swedish",
    sv: "Svenska"
  }
};

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage && (savedLanguage === "en" || savedLanguage === "sv") 
      ? savedLanguage 
      : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    // Dispatch a custom event so other components can react to language changes
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
  }, [language]);

  const t = (key: string): string => {
    return translations[key as keyof typeof translations]?.[language] || key;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={logoPath} 
                alt="Stockholms stad" 
                className="h-10" 
              />
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center space-x-4">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? "default" : "ghost"}
                  className="px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('queueDisplay')}
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"}
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  {t('adminPanel')}
                </Button>
              </Link>
              {isAuthenticated && (
                <Button 
                  variant="outline"
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t('logout')}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-2">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>
                    {t('english')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("sv")}>
                    {t('swedish')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button 
                variant="ghost" 
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-dark hover:text-primary hover:bg-gray-100 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? '' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <Button 
              variant={isActive('/') ? "default" : "ghost"}
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium"
            >
              {t('queueDisplay')}
            </Button>
          </Link>
          <Link href="/admin">
            <Button 
              variant={isActive('/admin') ? "default" : "ghost"}
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <Lock className="h-4 w-4 mr-1" />
              {t('adminPanel')}
            </Button>
          </Link>
          {isAuthenticated && (
            <Button 
              variant="outline"
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              {t('logout')}
            </Button>
          )}
          
          <div className="px-3 py-2 mt-4">
            <div className="text-sm font-medium text-gray-500 mb-2">
              {t('language')}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={language === "en" ? "default" : "outline"}
                size="sm" 
                onClick={() => setLanguage("en")}
              >
                {t('english')}
              </Button>
              <Button 
                variant={language === "sv" ? "default" : "outline"}
                size="sm" 
                onClick={() => setLanguage("sv")}
              >
                {t('swedish')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
