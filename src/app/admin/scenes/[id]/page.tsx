import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Doll, Scene } from "@/lib/types";
import { SceneEditor } from "@/components/admin/scene-editor";

export const dynamic = "force-dynamic";

export default async function SceneEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseAdmin();
  const [{ data: scene }, { data: dolls }] = await Promise.all([
    sb.from("scenes").select("*").eq("id", id).single(),
    sb.from("dolls").select("*, doll_variants(*)").order("name"),
  ]);
  if (!scene) notFound();

  return <SceneEditor scene={scene as Scene} dolls={(dolls ?? []) as Doll[]} />;
}
