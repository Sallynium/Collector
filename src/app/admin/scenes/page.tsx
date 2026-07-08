import { supabaseAdmin } from "@/lib/supabase/server";
import type { Scene } from "@/lib/types";
import { ScenesManager } from "@/components/admin/scenes-manager";

export const dynamic = "force-dynamic";

export default async function AdminScenesPage() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("scenes")
    .select("*")
    .order("created_at", { ascending: false });
  return <ScenesManager scenes={(data ?? []) as Scene[]} />;
}
