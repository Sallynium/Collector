import { isSupabaseConfigured, supabaseAnon } from "@/lib/supabase/server";
import type { Cabinet, Doll, Series } from "@/lib/types";
import { Gallery } from "@/components/gallery";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const sb = supabaseAnon();
  const [dollsRes, seriesRes, cabinetsRes] = await Promise.all([
    sb
      .from("dolls")
      .select("*, doll_variants(*)")
      .order("created_at", { ascending: false }),
    sb.from("series").select("*").order("name"),
    sb.from("cabinets").select("*").order("name"),
  ]);

  const dolls = (dollsRes.data ?? []) as Doll[];
  const series = (seriesRes.data ?? []) as Series[];
  const cabinets = (cabinetsRes.data ?? []) as Cabinet[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏆 我的電競娃娃收藏</h1>
        <p className="mt-1 text-muted-foreground">
          點擊娃娃可切換欣賞不同造型
        </p>
      </div>
      <Gallery dolls={dolls} series={series} cabinets={cabinets} />
    </div>
  );
}
