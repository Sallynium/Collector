"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createScene, deleteScene, setScenePublished } from "@/app/actions/scenes";
import type { Scene } from "@/lib/types";

export function ScenesManager({ scenes }: { scenes: Scene[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function create() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const id = await createScene(name.trim());
        router.push(`/admin/scenes/${id}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "發生錯誤");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex gap-2 py-4">
          <Input
            placeholder="新場景名稱（例如：電競桌 A）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={create} disabled={pending || !name.trim()}>
            建立場景
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => (
          <Card key={scene.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{scene.name}</span>
                <Badge variant={scene.is_published ? "default" : "outline"}>
                  {scene.is_published ? "已發布" : "草稿"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/scenes/${scene.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    編輯
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await setScenePublished(scene.id, !scene.is_published);
                        toast.success(scene.is_published ? "已取消發布" : "已發布");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "發生錯誤");
                      }
                    })
                  }
                >
                  {scene.is_published ? "取消發布" : "發布"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await deleteScene(scene.id);
                        toast.success("已刪除");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "發生錯誤");
                      }
                    })
                  }
                >
                  刪除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
