import { getPublishedScene, listPublishedScenes } from "@/lib/content/store";
import { SceneCanvas } from "@/components/scene-canvas";

/** 靜態輸出時，為每個已發布場景產生頁面；未發布的不存在 */
export async function generateStaticParams() {
  const scenes = await listPublishedScenes();
  // output: export 不允許空陣列（fork 後的初始狀態），給一個佔位 id，
  // 對應頁面會渲染成空狀態，且不會被任何頁面連到
  if (scenes.length === 0) return [{ id: "empty" }];
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
  // 佔位 id（見 generateStaticParams）或場景已被取消發布時的空狀態
  if (!scene) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        這個場景不存在或尚未發布
      </div>
    );
  }

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
