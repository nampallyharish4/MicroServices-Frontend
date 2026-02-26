import { Layout } from "@/components/layout";
import { Button } from "@/components/button";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useForm } from "react-form"; // Simple form handling, could use react-hook-form
import { useState } from "react";
import { useLocation } from "wouter";

export default function Checkout() {
  const { data: cartItems } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", address: "", city: "", zip: "", country: "US"
  });

  if (!cartItems || cartItems.length === 0) {
    return <Layout><div className="text-center py-24">Cart is empty. Redirecting...</div></Layout>;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const total = subtotal + (subtotal > 200 ? 0 : 15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate({
      shippingAddress: formData
    }, {
      onSuccess: () => setLocation("/orders")
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-12 text-center">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b">Shipping Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">First Name</label>
                  <input required className="w-full border p-3 bg-transparent focus:outline-none focus:border-primary transition-colors" value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Last Name</label>
                  <input required className="w-full border p-3 bg-transparent focus:outline-none focus:border-primary transition-colors" value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Address</label>
                <input required className="w-full border p-3 bg-transparent focus:outline-none focus:border-primary transition-colors" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">City</label>
                  <input required className="w-full border p-3 bg-transparent focus:outline-none focus:border-primary transition-colors" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">ZIP Code</label>
                  <input required className="w-full border p-3 bg-transparent focus:outline-none focus:border-primary transition-colors" value={formData.zip} onChange={e=>setFormData({...formData, zip: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b">Payment</h2>
              <div className="bg-muted/30 p-6 border text-center text-sm text-muted-foreground">
                <p>This is a demo application.</p>
                <p>Clicking "Place Order" will bypass actual payment processing.</p>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={createOrder.isPending}>
              Place Order - ${total.toFixed(2)}
            </Button>
          </form>

          <div className="bg-muted/20 p-8 h-fit sticky top-32">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b">Your Order</h2>
            <div className="space-y-4 mb-8">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-16 object-cover" />
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} | Size: {item.size}</p>
                    </div>
                  </div>
                  <span className="font-medium text-sm">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg uppercase tracking-wider">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
