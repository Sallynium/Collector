"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { Canvas, FabricImage, type FabricObject } from "fabric";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/scene-constants";
import type { SceneItem } from "@/lib/types";

export interface SceneCanvasHandle {
  addImage: (imageUrl: string, dollId: string, variantId: string) => Promise<void>;
  bringForward: () => void;
  sendBackward: () => void;
  deleteSelected: () => void;
  getLayout: () => SceneItem[];
}

export const SceneCanvas = forwardRef<
  SceneCanvasHandle,
  {
    backgroundUrl: string | null;
    initialLayout: SceneItem[];
    editable: boolean;
    onSelectionChange?: (hasSelection: boolean) => void;
  }
>(function SceneCanvas({ backgroundUrl, initialLayout, editable, onSelectionChange }, ref) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      selection: editable,
    });
    fabricRef.current = canvas;

    if (backgroundUrl) {
      FabricImage.fromURL(backgroundUrl, { crossOrigin: "anonymous" }).then((img) => {
        const scale = Math.max(
          CANVAS_WIDTH / (img.width || 1),
          CANVAS_HEIGHT / (img.height || 1)
        );
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    }

    Promise.all(
      initialLayout.map((item) =>
        FabricImage.fromURL(item.image_url, { crossOrigin: "anonymous" }).then((img) => {
          img.set({
            left: item.left,
            top: item.top,
            scaleX: item.scaleX,
            scaleY: item.scaleY,
            angle: item.angle,
            flipX: item.flipX ?? false,
            selectable: editable,
            evented: editable,
          });
          (img as FabricObject & { dollId?: string; variantId?: string }).dollId = item.doll_id;
          (img as FabricObject & { dollId?: string; variantId?: string }).variantId = item.variant_id;
          return img;
        })
      )
    ).then((imgs) => {
      imgs.forEach((img) => canvas.add(img));
      canvas.renderAll();
    });

    if (editable) {
      const handleSelection = () => onSelectionChange?.(canvas.getActiveObjects().length > 0);
      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", () => onSelectionChange?.(false));
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    async addImage(imageUrl: string, dollId: string, variantId: string) {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const img = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
      const scale = Math.min(1, 250 / (img.width || 250));
      img.set({
        left: CANVAS_WIDTH / 2 - 60,
        top: CANVAS_HEIGHT / 2 - 60,
        scaleX: scale,
        scaleY: scale,
      });
      (img as FabricObject & { dollId?: string; variantId?: string }).dollId = dollId;
      (img as FabricObject & { dollId?: string; variantId?: string }).variantId = variantId;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    },
    bringForward() {
      const canvas = fabricRef.current;
      const obj = canvas?.getActiveObject();
      if (canvas && obj) {
        canvas.bringObjectForward(obj);
        canvas.renderAll();
      }
    },
    sendBackward() {
      const canvas = fabricRef.current;
      const obj = canvas?.getActiveObject();
      if (canvas && obj) {
        canvas.sendObjectBackwards(obj);
        canvas.renderAll();
      }
    },
    deleteSelected() {
      const canvas = fabricRef.current;
      const obj = canvas?.getActiveObject();
      if (canvas && obj) {
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    },
    getLayout(): SceneItem[] {
      const canvas = fabricRef.current;
      if (!canvas) return [];
      return canvas.getObjects().map((obj) => {
        const o = obj as FabricObject & { dollId?: string; variantId?: string };
        return {
          doll_id: o.dollId ?? "",
          variant_id: o.variantId ?? "",
          image_url: (o as unknown as { getSrc?: () => string }).getSrc?.() ?? "",
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          scaleX: obj.scaleX ?? 1,
          scaleY: obj.scaleY ?? 1,
          angle: obj.angle ?? 0,
          flipX: obj.flipX ?? false,
        };
      });
    },
  }));

  return (
    <canvas
      ref={canvasElRef}
      className="rounded-md border shadow-sm"
    />
  );
});
