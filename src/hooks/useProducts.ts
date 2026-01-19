import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  sku?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  description?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("خطأ في تحميل الأصناف");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: ProductInput) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      setProducts([data, ...products]);
      toast.success("تم إضافة الصنف بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في إضافة الصنف");
      console.error("Error adding product:", error);
      return null;
    }
  };

  const updateProduct = async (id: string, product: Partial<ProductInput>) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setProducts(products.map((p) => (p.id === id ? data : p)));
      toast.success("تم تحديث الصنف بنجاح");
      return data;
    } catch (error: any) {
      toast.error("خطأ في تحديث الصنف");
      console.error("Error updating product:", error);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success("تم حذف الصنف بنجاح");
      return true;
    } catch (error: any) {
      toast.error("خطأ في حذف الصنف");
      console.error("Error deleting product:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
