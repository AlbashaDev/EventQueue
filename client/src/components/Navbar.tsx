import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary">Queue Management System</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center space-x-4">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? "default" : "ghost"}
                  className="px-3 py-2 rounded-md text-sm font-medium"
                >
                  Queue Display
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"}
                  className="px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Panel
                </Button>
              </Link>
              <Link href="/scan">
                <Button 
                  variant={isActive('/scan') ? "default" : "ghost"}
                  className="px-3 py-2 rounded-md text-sm font-medium"
                >
                  Scan QR
                </Button>
              </Link>
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
              Queue Display
            </Button>
          </Link>
          <Link href="/admin">
            <Button 
              variant={isActive('/admin') ? "default" : "ghost"}
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium"
            >
              Admin Panel
            </Button>
          </Link>
          <Link href="/scan">
            <Button 
              variant={isActive('/scan') ? "default" : "ghost"}
              className="w-full justify-start px-3 py-2 rounded-md text-base font-medium"
            >
              Scan QR
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
