import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useCart() {
  return useQuery({
    queryKey: [api.cart.list.path],
    queryFn: async () => {
      const res = await authFetch(api.cart.list.path);
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch cart");
      
      const data = await res.json();
      return api.cart.list.responses[200].parse(data);
    },
    retry: false,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: z.infer<typeof api.cart.add.input>) => {
      const validated = api.cart.add.input.parse(item);
      const res = await authFetch(api.cart.add.path, {
        method: api.cart.add.method,
        body: JSON.stringify(validated),
      });

      if (res.status === 401) throw new Error("Please log in to add items to cart");
      if (!res.ok) throw new Error("Failed to add to cart");
      
      const data = await res.json();
      return api.cart.add.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] });
      toast({ title: "Added to cart", description: "Your item has been added to the bag." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
      const url = buildUrl(api.cart.update.path, { id });
      const validated = api.cart.update.input.parse({ quantity });
      
      const res = await authFetch(url, {
        method: api.cart.update.method,
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to update cart");
      const data = await res.json();
      return api.cart.update.responses[200].parse(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cart.list.path] }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cart.delete.path, { id });
      const res = await authFetch(url, { method: api.cart.delete.method });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cart.list.path] }),
  });
}
