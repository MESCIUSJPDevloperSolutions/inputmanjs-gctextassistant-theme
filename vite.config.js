import { defineConfig } from "vite";

export default defineConfig({
    // フロントエンドのソースコードのルートを "client" フォルダに設定
    root: "client",

    // ビルド出力先をルートの "dist" ディレクトリに指定
    build: {
        outDir: "../dist",
    },
});