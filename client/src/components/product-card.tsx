import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted mb-4">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.featured && (
          <div className="absolute top-4 left-4 bg-background text-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider">
            Featured
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-background text-foreground text-center py-3 text-sm font-medium uppercase tracking-wide">
            Quick View
          </div>
        </div>
      </Link>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-base mb-1">{product.name}</h3>
          <p className="text-muted-foreground text-sm">{product.brand}</p>
        </div>
        <span className="font-medium">${Number(product.price).toFixed(2)}</span>
      </div>
    </motion.div>
  );
}
