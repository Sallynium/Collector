"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { renameVariant, deleteVariant } from "@/app/actions/inventory";
import type { DollVariant } from "@/lib/types";

export function VariantManager({
  dollId,
  variants,
}: {
  dollId: string;
  variants: DollVariant[];
}) {
  if (variants.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          尚無造型照片，點右上角「新增造型」開始上傳並去背。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {variants.map((v) => (
        <VariantCard key={v.id} dollId={dollId} variant={v} />
      ))}
    </div>
  );
}

function VariantCard({
  dollId,
  variant,
}: {
  dollId: string;
  variant: DollVariant;
}) {
  const [name, setName] = useState(variant.name);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]">
        <Image
          src={variant.image_url}
          alt={variant.name}
          fill
          className="object-contain p-2"
          unoptimized
        />
      </div>
      <CardContent className="flex gap-2 p-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() && name !== variant.name) {
              startTransition(async () => {
                try {
                  await renameVariant(variant.id, dollId, name.trim());
                  toast.success("已更新造型名稱");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "發生錯誤");
                }
              });
            }
          }}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await deleteVariant(variant.id, dollId);
                toast.success("已刪除");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "發生錯誤");
              }
            })
          }
        >
          刪除
        </Button>
      </CardContent>
    </Card>
  );
}
