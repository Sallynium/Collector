import { notFound } from "next/navigation";
import { getScene, listDollsWithVariants } from "@/lib/content/store";
import { SceneEditor } from "@/components/admin/scene-editor";

export const dynamic = "force-dynamic";

export default async function SceneEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [scene, dolls] = await Promise.all([getScene(id), listDollsWithVariants()]);
  if (!scene) notFound();

  return <SceneEditor scene={scene} dolls={dolls} />;
}
