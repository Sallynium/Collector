import type { NextConfig } from "next";

/**
 * 兩種模式：
 * - 一般模式（本機 dev / 伺服器部署）：管理後台（*.dev.tsx 頁面）存在
 * - 靜態輸出（STATIC_EXPORT=1）：純展示站，後台頁面被 pageExtensions 排除，
 *   輸出 out/ 可直接放 GitHub Pages（NEXT_PUBLIC_BASE_PATH 設子路徑，如 /Collector）
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  pageExtensions: isStaticExport
    ? ["tsx", "ts"]
    : ["dev.tsx", "dev.ts", "tsx", "ts"],
  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
        // 每頁輸出成 資料夾/index.html，GitHub Pages 帶不帶尾斜線都能開
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
