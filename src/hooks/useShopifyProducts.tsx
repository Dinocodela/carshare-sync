import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductByHandle } from "@/lib/shopify/storefront";

export function useShopifyProducts(query?: string) {
  return useQuery({
    queryKey: ["shopify-products", query ?? "all"],
    queryFn: () => fetchProducts(50, query),
    staleTime: 1000 * 60 * 5,
  });
}

export function useShopifyProduct(handle: string | undefined) {
  return useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle as string),
    enabled: !!handle,
    staleTime: 1000 * 60 * 5,
  });
}
