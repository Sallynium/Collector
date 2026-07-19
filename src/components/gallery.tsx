"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cabinet, Doll, Series } from "@/lib/types";
import { asset } from "@/lib/asset";

const ALL = "__all__";

export function Gallery({
  dolls,
  series,
  cabinets,
}: {
  dolls: Doll[];
  series: Series[];
  cabinets: Cabinet[];
}) {
  const [seriesFilter, setSeriesFilter] = useState(ALL);
  const [cabinetFilter, setCabinetFilter] = useState(ALL);

  const filtered = useMemo(() => {
    return dolls.filter((d) => {
      if (seriesFilter !== ALL && d.series_id !== seriesFilter) return false;
      if (cabinetFilter !== ALL && d.cabinet_id !== cabinetFilter) return false;
      return true;
    });
  }, [dolls, seriesFilter, cabinetFilter]);

  if (dolls.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          還沒有任何娃娃，請先前往{" "}
          <a href="/admin/inventory" className="underline">
            管理後台
          </a>{" "}
          新增。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Select value={seriesFilter} onValueChange={setSeriesFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="全部系列" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>全部系列</SelectItem>
            {series.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cabinetFilter} onValueChange={setCabinetFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="全部收藏櫃" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>全部收藏櫃</SelectItem>
            {cabinets.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((doll) => (
          <DollCard
            key={doll.id}
            doll={doll}
            seriesName={series.find((s) => s.id === doll.series_id)?.name}
            cabinetName={cabinets.find((c) => c.id === doll.cabinet_id)?.name}
          />
        ))}
      </div>
    </div>
  );
}

function DollCard({
  doll,
  seriesName,
  cabinetName,
}: {
  doll: Doll;
  seriesName?: string;
  cabinetName?: string;
}) {
  const variants = (doll.doll_variants ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = variants[activeIdx];

  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-square items-center justify-center bg-muted/40">
        {active ? (
          <Image
            src={asset(active.image_url)}
            alt={`${doll.name} - ${active.name}`}
            fill
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <span className="text-sm text-muted-foreground">尚無照片</span>
        )}
      </div>
      <CardContent className="space-y-2 p-3">
        <div className="font-medium">{doll.name}</div>
        <div className="flex flex-wrap gap-1">
          {seriesName && <Badge variant="secondary">{seriesName}</Badge>}
          {cabinetName && <Badge variant="outline">{cabinetName}</Badge>}
        </div>
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setActiveIdx(i)}
                className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                  i === activeIdx
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
