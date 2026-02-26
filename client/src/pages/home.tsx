import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/button";
import { useProducts } from "@/hooks/use-products";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featured = products?.filter(p => p.featured).slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        {/* landing page hero editorial fashion shot */}
        <div className="absolute inset-0 bg-black">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000&q=80&fit=crop" 
            alt="New Collection"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="text-white font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6">
              The Art of <br/> Minimal
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-lg mx-auto font-light">
              Discover our new collection defining modern luxury through clean lines and uncompromising quality.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/category/mens-wear">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90">Shop Menswear</Button>
              </Link>
              <Link href="/category/shoes">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black">Shop Footwear</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Split */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <Link href="/category/mens-wear" className="group relative h-[60vh] overflow-hidden bg-muted block">
          {/* landing page menswear category split */}
          <img 
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1000&q=80&fit=crop"
            alt="Menswear"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white font-display text-4xl uppercase tracking-widest font-bold">Menswear</h2>
          </div>
        </Link>
        <Link href="/category/shoes" className="group relative h-[60vh] overflow-hidden bg-muted block">
          {/* landing page shoes category split */}
          <img 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80&fit=crop"
            alt="Footwear"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white font-display text-4xl uppercase tracking-widest font-bold">Footwear</h2>
          </div>
        </Link>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Curated Selection</h2>
          <Link href="/category/mens-wear" className="text-sm font-bold uppercase tracking-wider hover:underline underline-offset-4 hidden sm:block">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[3/4] mb-4"></div>
                <div className="h-4 bg-muted w-3/4 mb-2"></div>
                <div className="h-4 bg-muted w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured?.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
