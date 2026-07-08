"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SceneCanvas, type SceneCanvasHandle } from "@/components/scene-canvas";
import { uploadSceneBackground, saveSceneLayout } from "@/app/actions/scenes";
import type { Doll, Scene } from "@/lib/types";

export function SceneEditor({ scene, dolls }: { scene: Scene; dolls: Doll[] }) {
  const [backgroundUrl, setBackgroundUrl] = useState(scene.background_url);
  const [dollId, setDollId] = useState<string>(dolls[0]?.id ?? "");
  const [variantId, setVariantId] = useState<string>("");
  const [hasSelection, setHasSelection] = useState(false);
  const [pending, startTransition] = useTransition();
  const canvasRef = useRef<SceneCanvasHandle>(null);

  const selectedDoll = dolls.find((d) => d.id === dollId);
  const variants = selectedDoll?.doll_variants ?? [];

  function onBackgroundFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("sceneId", scene.id);
        fd.set("file", file);
        const url = await uploadSceneBackground(fd);
        setBackgroundUrl(url);
        toast.success("背景已上傳，請重新整理頁面套用");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "上傳失敗");
      }
    });
  }

  function addDollToCanvas() {
    const variant = variants.find((v) => v.id === variantId) ?? variants[0];
    if (!variant) {
      toast.error("此娃娃尚無造型照片");
      return;
    }
    canvasRef.current?.addImage(variant.image_url, dollId, variant.id);
  }

  function save() {
    const layout = canvasRef.current?.getLayout() ?? [];
    startTransition(async () => {
      try {
        await saveSceneLayout(scene.id, layout);
        toast.success("佈局已儲存");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "儲存失敗");
      }
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">場景編輯：{scene.name}</h1>

      <div className="flex flex-wrap items-end gap-4 rounded-md border p-4">
        <div className="space-y-1">
          <Label>背景圖</Label>
          <Input type="file" accept="image/*" onChange={onBackgroundFileChange} />
        </div>
        <div className="space-y-1">
          <Label>選擇娃娃</Label>
          <Select
            value={dollId}
            onValueChange={(v) => {
              setDollId(v);
              setVariantId("");
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="娃娃" />
            </SelectTrigger>
            <SelectContent>
              {dolls.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>造型</Label>
          <Select value={variantId} onValueChange={setVariantId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="預設造型" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addDollToCanvas} disabled={!variants.length}>
          放入場景
        </Button>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            disabled={!hasSelection}
            onClick={() => canvasRef.current?.bringForward()}
          >
            上移一層
          </Button>
          <Button
            variant="outline"
            disabled={!hasSelection}
            onClick={() => canvasRef.current?.sendBackward()}
          >
            下移一層
          </Button>
          <Button
            variant="outline"
            disabled={!hasSelection}
            onClick={() => canvasRef.current?.deleteSelected()}
          >
            移除
          </Button>
          <Button onClick={save} disabled={pending}>
            儲存佈局
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        提示：拖曳娃娃可移動位置，選取後可用四角控點縮放與旋轉。
      </p>

      <SceneCanvas
        ref={canvasRef}
        backgroundUrl={backgroundUrl}
        initialLayout={scene.layout}
        editable
        onSelectionChange={setHasSelection}
      />
    </div>
  );
}
