import { Layout } from "@/components/layout";
import { Button } from "@/components/button";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(Number(id));
  const addToCart = useAddToCart();
  
  const [selectedSize, setSelectedSize] = useState<string>("");

  if (isLoading) return <Layout><div className="h-screen flex items-center justify-center animate-pulse text-2xl font-display">Loading Aura...</div></Layout>;
  if (!product) return <Layout><div className="h-screen flex items-center justify-center font-display text-2xl">Product not found.</div></Layout>;

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size"); // Using simple alert for brevity, toast is better in prod
      return;
    }
    addToCart.mutate({
      productId: product.id,
      size: selectedSize,
      quantity: 1
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-muted aspect-[3/4] lg:aspect-auto lg:h-[800px] overflow-hidden"
          >
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Link href={`/category/${product.category}`}>{product.category.replace('-', ' ')}</Link>
              <span className="mx-2">/</span>
              <span>{product.brand}</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
              {product.name}
            </h1>
            
            <p className="text-2xl font-light mb-8">${Number(product.price).toFixed(2)}</p>
            
            <div className="prose prose-sm max-w-none text-muted-foreground mb-12 leading-relaxed">
              <p>{product.description}</p>
              <p className="mt-4"><strong className="text-foreground">Color:</strong> {product.color}</p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold uppercase tracking-wider text-sm">Select Size</span>
                <button className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size: string | number) => (
                  <button
                    key={String(size)}
                    onClick={() => setSelectedSize(String(size))}
                    className={`w-14 h-14 border flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      selectedSize === String(size) 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full mb-6"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || !selectedSize}
              isLoading={addToCart.isPending}
            >
              {selectedSize ? 'Add to Cart' : 'Select a Size'}
            </Button>

            <div className="border-t pt-8 space-y-4 text-sm text-muted-foreground">
              <p className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span> In stock, ready to ship</p>
              <p className="flex items-center"><span className="w-2 h-2 bg-border rounded-full mr-3"></span> Free shipping over $200</p>
              <p className="flex items-center"><span className="w-2 h-2 bg-border rounded-full mr-3"></span> 14-day premium return service</p>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
