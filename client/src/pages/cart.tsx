import { Layout } from "@/components/layout";
import { Button } from "@/components/button";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Trash2, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const { data: cartItems, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  if (isLoading) return <Layout><div className="h-[60vh] flex items-center justify-center">Loading cart...</div></Layout>;

  const subtotal = cartItems?.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + (cartItems?.length ? shipping : 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-12">Shopping Bag</h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 border border-dashed">
            <p className="text-xl mb-6 text-muted-foreground">Your bag is currently empty.</p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Items List */}
            <div className="lg:col-span-8">
              <div className="hidden sm:grid grid-cols-12 gap-4 border-b pb-4 mb-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-8">
                {cartItems.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={item.id} 
                    className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center border-b pb-8 sm:border-none sm:pb-0"
                  >
                    <div className="col-span-1 sm:col-span-6 flex gap-6">
                      <Link href={`/product/${item.product.id}`} className="w-24 h-32 bg-muted flex-shrink-0">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-lg leading-tight mb-1">
                          <Link href={`/product/${item.product.id}`} className="hover:underline">{item.product.name}</Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">{item.product.brand}</p>
                        <p className="text-sm">Size: <span className="font-medium">{item.size}</span></p>
                        <p className="text-sm sm:hidden mt-2 font-medium">${Number(item.product.price).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                      <div className="flex items-center border">
                        <button 
                          className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                          onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                          onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                          disabled={updateItem.isPending}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-3 text-left sm:text-right font-medium text-lg hidden sm:block">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </div>

                    <div className="col-span-1 text-right">
                      <button 
                        onClick={() => removeItem.mutate(item.id)}
                        disabled={removeItem.isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-muted/30 p-8">
                <h2 className="font-display font-bold uppercase tracking-wider text-xl mb-6 border-b pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                </div>
                
                <div className="flex justify-between border-t pt-6 mb-8">
                  <span className="font-bold uppercase tracking-wider">Total</span>
                  <span className="font-bold text-xl">${total.toFixed(2)}</span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>
                
                <p className="text-xs text-center text-muted-foreground mt-6 uppercase tracking-widest">
                  Secure Encrypted Payment
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
