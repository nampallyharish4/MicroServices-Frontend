import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [api.products.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.products.list.path, window.location.origin);
      if (filters?.category) url.searchParams.append('category', filters.category);
      if (filters?.brand) url.searchParams.append('brand', filters.brand);
      if (filters?.search) url.searchParams.append('search', filters.search);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      return api.products.list.responses[200].parse(data);
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      
      const data = await res.json();
      return api.products.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}
