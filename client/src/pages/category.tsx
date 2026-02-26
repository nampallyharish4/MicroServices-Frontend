import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";
import { useParams } from "wouter";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function Category() {
  const params = useParams();
  const categoryId = params.id; // 'shoes' or 'mens-wear'
  
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const { data: products, isLoading } = useProducts({ 
    category: categoryId,
    brand: selectedBrand || undefined
  });

  const title = categoryId === 'shoes' ? 'Footwear' : 'Menswear';
  
  // Extract unique brands for filter
  const allProducts = useProducts({ category: categoryId }).data || [];
  const brands = Array.from(new Set(allProducts.map(p => p.brand)));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4"
          >
            {title}
          </motion.h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our curated collection of premium {title.toLowerCase()}, designed for the modern aesthetic.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="flex items-center space-x-2 font-bold uppercase tracking-wider mb-6 border-b pb-4">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </div>
            
            <div className="space-y-8 sticky top-32">
              <div>
                <h3 className="font-bold uppercase text-sm mb-4">Brand</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="brand" 
                      className="w-4 h-4 accent-primary border-border focus:ring-primary"
                      checked={selectedBrand === ""}
                      onChange={() => setSelectedBrand("")}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">All Brands</span>
                  </label>
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="brand" 
                        className="w-4 h-4 accent-primary border-border focus:ring-primary"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(brand)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-muted w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-24 bg-muted/30">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                <button 
                  onClick={() => setSelectedBrand("")}
                  className="mt-4 underline underline-offset-4 text-sm font-bold uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {products?.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
