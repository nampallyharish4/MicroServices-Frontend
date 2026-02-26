import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authFetch } from "@/lib/auth-fetch";
import { z } from "zod";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await authFetch(api.orders.list.path);
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch orders");
      
      const data = await res.json();
      return api.orders.list.responses[200].parse(data);
    },
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id });
      const res = await authFetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch order");
      
      const data = await res.json();
      return api.orders.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.orders.create.input>) => {
      const validated = api.orders.create.input.parse(data);
      const res = await authFetch(api.orders.create.path, {
        method: api.orders.create.method,
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to create order");
      
      const result = await res.json();
      return api.orders.create.responses[201].parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.cart.list.path] }); // Clear cart on success
    },
  });
}
