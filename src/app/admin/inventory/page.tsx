import { supabaseAdmin } from "@/lib/supabase/server";
import type { Cabinet, Doll, Series } from "@/lib/types";
import { InventoryManager } from "@/components/admin/inventory-manager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const sb = supabaseAdmin();
  const [dollsRes, seriesRes, cabinetsRes] = await Promise.all([
    sb
      .from("dolls")
      .select("*, doll_variants(*)")
      .order("created_at", { ascending: false }),
    sb.from("series").select("*").order("name"),
    sb.from("cabinets").select("*").order("name"),
  ]);

  return (
    <InventoryManager
      dolls={(dollsRes.data ?? []) as Doll[]}
      series={(seriesRes.data ?? []) as Series[]}
      cabinets={(cabinetsRes.data ?? []) as Cabinet[]}
    />
  );
}
