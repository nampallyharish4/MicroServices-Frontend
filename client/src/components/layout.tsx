import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuth();
  const { data: cart } = useCart();
  const { logout } = useLogout();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/category/mens-wear" className="text-sm font-medium tracking-wide uppercase hover:opacity-60 transition-opacity">
              Menswear
            </Link>
            <Link href="/category/shoes" className="text-sm font-medium tracking-wide uppercase hover:opacity-60 transition-opacity">
              Footwear
            </Link>
          </div>

          <Link href="/" className="font-display text-2xl md:text-3xl font-bold tracking-tighter uppercase absolute left-1/2 -translate-x-1/2">
            Aura.
          </Link>

          <div className="flex items-center space-x-4 md:space-x-6">
            <button className="hidden md:block hover:opacity-60 transition-opacity">
              <Search className="w-5 h-5" />
            </button>
            
            {user ? (
              <div className="relative group">
                <Link href="/profile" className="hover:opacity-60 transition-opacity flex items-center">
                  <User className="w-5 h-5" />
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 shadow-xl">
                  <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-muted">Orders</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hover:opacity-60 transition-opacity">
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link href="/cart" className="relative hover:opacity-60 transition-opacity flex items-center">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background md:hidden flex flex-col"
          >
            <div className="p-4 flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-8 p-8 text-2xl font-display uppercase tracking-wider">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/category/mens-wear" onClick={() => setMobileMenuOpen(false)}>Menswear</Link>
              <Link href="/category/shoes" onClick={() => setMobileMenuOpen(false)}>Footwear</Link>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                  <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-destructive">Logout</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-[88px] md:pt-[96px]">
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-display text-3xl font-bold tracking-tighter uppercase mb-6">Aura.</h2>
            <p className="text-primary-foreground/60 max-w-sm">
              Redefining modern luxury through minimalist design and uncompromising quality.
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-6 text-sm">Shop</h4>
            <ul className="space-y-4 text-primary-foreground/60">
              <li><Link href="/category/mens-wear" className="hover:text-primary-foreground transition-colors">Menswear</Link></li>
              <li><Link href="/category/shoes" className="hover:text-primary-foreground transition-colors">Footwear</Link></li>
              <li><Link href="/new" className="hover:text-primary-foreground transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-6 text-sm">Support</h4>
            <ul className="space-y-4 text-primary-foreground/60">
              <li><button className="hover:text-primary-foreground transition-colors">Contact Us</button></li>
              <li><button className="hover:text-primary-foreground transition-colors">Shipping & Returns</button></li>
              <li><button className="hover:text-primary-foreground transition-colors">FAQ</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
