import { Layout } from "@/components/layout";
import { useOrders } from "@/hooks/use-orders";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders, isLoading } = useOrders();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-12">Order History</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-48 bg-muted animate-pulse"></div>)}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 border">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link href="/" className="underline uppercase text-sm font-bold tracking-wider">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map(order => (
              <div key={order.id} className="border p-6 md:p-8 relative">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-widest">
                  {order.status}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b text-sm">
                  <div>
                    <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Order Number</p>
                    <p className="font-medium">#{order.id.toString().padStart(6, '0')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Date</p>
                    <p className="font-medium">{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Total</p>
                    <p className="font-medium">${Number(order.totalAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-widest text-xs mb-1">Shipping</p>
                    <p className="font-medium truncate" title={order.shippingAddress?.address}>
                      {order.shippingAddress?.city}, {order.shippingAddress?.country || 'US'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-6">
                      <Link href={`/product/${item.productId}`} className="w-16 h-20 bg-muted flex-shrink-0">
                         {item.product?.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover"/>}
                      </Link>
                      <div className="flex-1">
                        <Link href={`/product/${item.productId}`} className="font-bold hover:underline">{item.product?.name || 'Product unavailable'}</Link>
                        <p className="text-sm text-muted-foreground mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
