import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/StockholmsStad_logotypeStandardA4_300ppi_svart.jpg";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                  Kövisning
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"}
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Adminpanel
                </Button>
              </Link>
              {isAuthenticated && (
                <Button 
                  variant="outline"
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logga ut
                </Button>
              )}
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
              Kövisning
            </Button>
          </Link>
          <Link href="/admin">
            <Button 
              variant={isActive('/admin') ? "default" : "ghost"}
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <Lock className="h-4 w-4 mr-1" />
              Adminpanel
            </Button>
          </Link>
          {isAuthenticated && (
            <Button 
              variant="outline"
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logga ut
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
