
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-8 py-4",
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        )}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xl font-medium transition-all-200 hover:opacity-80"
          >
            Comparify
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" current={location.pathname}>
              Home
            </NavLink>
            <NavLink to="/compare" current={location.pathname}>
              Create Comparison
            </NavLink>
          </nav>
          
          <div className="flex items-center">
            <Link 
              to="/compare" 
              className={cn(
                "flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all-200",
                "bg-black text-white hover:bg-black/90"
              )}
            >
              Start Comparing <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      
      <footer className="bg-secondary py-8 px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-medium">Comparify</div>
              <div className="text-sm text-muted-foreground mt-1">Make informed decisions</div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Comparify. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  current: string;
  children: React.ReactNode;
}

const NavLink = ({ to, current, children }: NavLinkProps) => {
  const isActive = current === to || (to !== "/" && current.startsWith(to));
  
  return (
    <Link
      to={to}
      className={cn(
        "relative text-sm font-medium transition-all-200",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />
      )}
    </Link>
  );
};

export default Layout;
