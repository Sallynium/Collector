"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSeries,
  deleteSeries,
  createCabinet,
  deleteCabinet,
  createDoll,
  deleteDoll,
} from "@/app/actions/inventory";
import type { Cabinet, Doll, Series } from "@/lib/types";

const NONE = "__none__";

export function InventoryManager({
  dolls,
  series,
  cabinets,
}: {
  dolls: Doll[];
  series: Series[];
  cabinets: Cabinet[];
}) {
  return (
    <Tabs defaultValue="dolls">
      <TabsList>
        <TabsTrigger value="dolls">娃娃</TabsTrigger>
        <TabsTrigger value="series">系列</TabsTrigger>
        <TabsTrigger value="cabinets">收藏櫃</TabsTrigger>
      </TabsList>

      <TabsContent value="dolls" className="mt-4">
        <DollsPanel dolls={dolls} series={series} cabinets={cabinets} />
      </TabsContent>
      <TabsContent value="series" className="mt-4">
        <SimpleListPanel
          title="系列"
          items={series.map((s) => ({ id: s.id, label: s.name, sub: s.description }))}
          onCreate={async (name, sub) => createSeries(name, sub)}
          onDelete={async (id) => deleteSeries(id)}
          subPlaceholder="描述（選填）"
        />
      </TabsContent>
      <TabsContent value="cabinets" className="mt-4">
        <SimpleListPanel
          title="收藏櫃"
          items={cabinets.map((c) => ({ id: c.id, label: c.name, sub: c.location }))}
          onCreate={async (name, sub) => createCabinet(name, sub)}
          onDelete={async (id) => deleteCabinet(id)}
          subPlaceholder="位置（選填）"
        />
      </TabsContent>
    </Tabs>
  );
}

function SimpleListPanel({
  title,
  items,
  onCreate,
  onDelete,
  subPlaceholder,
}: {
  title: string;
  items: { id: string; label: string; sub?: string | null }[];
  onCreate: (name: string, sub: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  subPlaceholder: string;
}) {
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await onCreate(name.trim(), sub.trim());
        setName("");
        setSub("");
        toast.success(`已新增${title}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "發生錯誤");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新增{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder={`${title}名稱`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder={subPlaceholder}
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            className="w-48"
          />
          <Button onClick={submit} disabled={pending || !name.trim()}>
            新增
          </Button>
        </div>
        <ul className="divide-y rounded-md border">
          {items.length === 0 && (
            <li className="p-3 text-sm text-muted-foreground">尚無資料</li>
          )}
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-medium">{item.label}</div>
                {item.sub && (
                  <div className="text-muted-foreground">{item.sub}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await onDelete(item.id);
                      toast.success("已刪除");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "發生錯誤");
                    }
                  })
                }
              >
                刪除
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DollsPanel({
  dolls,
  series,
  cabinets,
}: {
  dolls: Doll[];
  series: Series[];
  cabinets: Cabinet[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seriesId, setSeriesId] = useState(NONE);
  const [cabinetId, setCabinetId] = useState(NONE);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createDoll({
          name: name.trim(),
          description: description.trim(),
          seriesId: seriesId === NONE ? null : seriesId,
          cabinetId: cabinetId === NONE ? null : cabinetId,
        });
        setName("");
        setDescription("");
        setSeriesId(NONE);
        setCabinetId(NONE);
        toast.success("已新增娃娃，請至詳細頁上傳照片");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "發生錯誤");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>新增娃娃</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="娃娃名稱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-48"
            />
            <Select value={seriesId} onValueChange={setSeriesId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="系列" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>不指定系列</SelectItem>
                {series.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cabinetId} onValueChange={setCabinetId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="收藏櫃" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>不指定收藏櫃</SelectItem>
                {cabinets.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="描述（選填）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={submit} disabled={pending || !name.trim()}>
            新增
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dolls.map((doll) => (
          <Card key={doll.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{doll.name}</span>
                <span className="text-xs text-muted-foreground">
                  {doll.doll_variants?.length ?? 0} 個造型
                </span>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/dolls/${doll.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    管理造型
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await deleteDoll(doll.id);
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
