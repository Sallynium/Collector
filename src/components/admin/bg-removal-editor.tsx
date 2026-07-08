"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { addVariant } from "@/app/actions/inventory";

const MAX_DIM = 900;
type Stage = "select" | "processing" | "edit" | "saving";
type BrushMode = "keep" | "erase";

export function BgRemovalEditor({ dollId }: { dollId: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("select");
  const [variantName, setVariantName] = useState("新造型");
  const [brushMode, setBrushMode] = useState<BrushMode>("keep");
  const [brushSize, setBrushSize] = useState(30);
  const [progress, setProgress] = useState("");

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const dimsRef = useRef({ w: 0, h: 0 });

  const composite = useCallback(() => {
    const orig = originalCanvasRef.current;
    const mask = maskCanvasRef.current;
    const preview = previewCanvasRef.current;
    if (!orig || !mask || !preview) return;
    const { w, h } = dimsRef.current;
    const octx = orig.getContext("2d")!;
    const mctx = mask.getContext("2d")!;
    const pctx = preview.getContext("2d")!;
    const origData = octx.getImageData(0, 0, w, h);
    const maskData = mctx.getImageData(0, 0, w, h);
    const out = pctx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      out.data[o] = origData.data[o];
      out.data[o + 1] = origData.data[o + 1];
      out.data[o + 2] = origData.data[o + 2];
      out.data[o + 3] = maskData.data[o]; // red channel of mask = alpha level
    }
    pctx.clearRect(0, 0, w, h);
    pctx.putImageData(out, 0, 0);
  }, []);

  async function handleFile(file: File) {
    setStage("processing");
    setProgress("讀取圖片…");
    try {
      const imgUrl = URL.createObjectURL(file);
      const img = await loadImage(imgUrl);
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      dimsRef.current = { w, h };

      const orig = originalCanvasRef.current!;
      const mask = maskCanvasRef.current!;
      const preview = previewCanvasRef.current!;
      [orig, mask, preview].forEach((c) => {
        c.width = w;
        c.height = h;
      });
      orig.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(imgUrl);

      setProgress("AI 去背處理中（首次使用需下載模型，稍候）…");
      const { removeBackground } = await import("@imgly/background-removal");
      const resultBlob = await removeBackground(file);
      const resultUrl = URL.createObjectURL(resultBlob);
      const resultImg = await loadImage(resultUrl);

      const maskCtx = mask.getContext("2d")!;
      maskCtx.clearRect(0, 0, w, h);
      maskCtx.drawImage(resultImg, 0, 0, w, h);
      const md = maskCtx.getImageData(0, 0, w, h);
      // Convert alpha channel into a grayscale mask (R=G=B=alpha, A=255)
      for (let i = 0; i < w * h; i++) {
        const o = i * 4;
        const a = md.data[o + 3];
        md.data[o] = a;
        md.data[o + 1] = a;
        md.data[o + 2] = a;
        md.data[o + 3] = 255;
      }
      maskCtx.putImageData(md, 0, 0);
      URL.revokeObjectURL(resultUrl);

      composite();
      setStage("edit");
    } catch (err) {
      console.error(err);
      toast.error("AI 去背失敗，請重試或改用其他圖片");
      setStage("select");
    }
  }

  function canvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = previewCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function paintAt(x: number, y: number) {
    const mask = maskCanvasRef.current!;
    const ctx = mask.getContext("2d")!;
    ctx.fillStyle = brushMode === "keep" ? "white" : "black";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    composite();
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    const { x, y } = canvasPoint(e);
    paintAt(x, y);
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const { x, y } = canvasPoint(e);
    paintAt(x, y);
  }
  function onPointerUp() {
    drawingRef.current = false;
  }

  async function handleSave() {
    const preview = previewCanvasRef.current!;
    setStage("saving");
    try {
      const blob: Blob = await new Promise((resolve, reject) =>
        preview.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("匯出圖片失敗"))),
          "image/png"
        )
      );
      const formData = new FormData();
      formData.set("dollId", dollId);
      formData.set("name", variantName || "新造型");
      formData.set("file", new File([blob], "variant.png", { type: "image/png" }));
      await addVariant(formData);
      toast.success("造型已儲存");
      router.push(`/admin/dolls/${dollId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "儲存失敗");
      setStage("edit");
    }
  }

  return (
    <div className="space-y-4">
      {stage === "select" && (
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="text-muted-foreground">
              選擇一張娃娃照片，AI 會自動去背，接著可用魔術筆手動修補細節
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="mx-auto max-w-xs"
            />
          </CardContent>
        </Card>
      )}

      {stage === "processing" && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {progress}
          </CardContent>
        </Card>
      )}

      <div className={stage === "edit" || stage === "saving" ? "space-y-4" : "hidden"}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label>造型名稱</Label>
            <Input
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-1">
            <Label>筆刷模式</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={brushMode === "keep" ? "default" : "outline"}
                onClick={() => setBrushMode("keep")}
                className={brushMode === "keep" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                🟢 強迫保留
              </Button>
              <Button
                type="button"
                size="sm"
                variant={brushMode === "erase" ? "default" : "outline"}
                onClick={() => setBrushMode("erase")}
                className={brushMode === "erase" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                🔴 強迫去除
              </Button>
            </div>
          </div>
          <div className="w-40 space-y-1">
            <Label>筆刷大小：{brushSize}px</Label>
            <Slider
              value={[brushSize]}
              min={5}
              max={100}
              step={1}
              onValueChange={(v) => setBrushSize(v[0])}
            />
          </div>
          <Button onClick={handleSave} disabled={stage === "saving"}>
            {stage === "saving" ? "儲存中…" : "儲存造型"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStage("select");
              setProgress("");
            }}
          >
            重新選圖
          </Button>
        </div>

        <div className="inline-block rounded-md border bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] p-1">
          <canvas
            ref={previewCanvasRef}
            className="max-w-full touch-none"
            style={{ cursor: "crosshair" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          在圖片上塗抹：綠色筆刷強迫保留該區域（適合修補耳機、頭髮等被誤刪的細節），紅色筆刷強迫去除背景殘留。
        </p>
      </div>

      <canvas ref={originalCanvasRef} className="hidden" />
      <canvas ref={maskCanvasRef} className="hidden" />
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
