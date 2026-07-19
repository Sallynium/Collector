import Link from "next/link";
import Image from "next/image";
import { listPublishedScenes } from "@/lib/content/store";
import { asset } from "@/lib/asset";
import { Card, CardContent } from "@/components/ui/card";

export default async function ScenesListPage() {
  const scenes = await listPublishedScenes();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🖼️ 虛擬收藏室</h1>
      {scenes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            尚無公開場景
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene) => (
            <Link key={scene.id} href={`/scenes/${scene.id}`}>
              <Card className="overflow-hidden transition-colors hover:border-primary">
                <div className="relative aspect-video bg-muted">
                  {scene.background_url && (
                    <Image
                      src={asset(scene.background_url)}
                      alt={scene.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <CardContent className="p-3 font-medium">{scene.name}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
