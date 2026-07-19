import { notFound } from "next/navigation";
import { getPublishedScene, listPublishedScenes } from "@/lib/content/store";
import { SceneCanvas } from "@/components/scene-canvas";

/** 靜態輸出時，為每個已發布場景產生頁面；未發布的不存在 */
export async function generateStaticParams() {
  const scenes = await listPublishedScenes();
  return scenes.map((s) => ({ id: s.id }));
}

export const dynamicParams = false;

export default async function ScenePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scene = await getPublishedScene(id);
  if (!scene) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{scene.name}</h1>
      <div className="overflow-auto">
        <SceneCanvas
          backgroundUrl={scene.background_url}
          initialLayout={scene.layout}
          editable={false}
        />
      </div>
    </div>
  );
}
