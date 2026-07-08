import { notFound } from "next/navigation";
import { supabaseAnon } from "@/lib/supabase/server";
import type { Scene } from "@/lib/types";
import { SceneCanvas } from "@/components/scene-canvas";

export const dynamic = "force-dynamic";

export default async function ScenePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseAnon();
  const { data: scene } = await sb
    .from("scenes")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();
  if (!scene) notFound();

  const s = scene as Scene;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{s.name}</h1>
      <div className="overflow-auto">
        <SceneCanvas
          backgroundUrl={s.background_url}
          initialLayout={s.layout}
          editable={false}
        />
      </div>
    </div>
  );
}
