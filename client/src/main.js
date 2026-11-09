import "@mescius/inputman.richtexteditor/CSS/gc.inputman.richtexteditor.css";
import { InputMan } from "@mescius/inputman.richtexteditor";
import "@mescius/inputman.richtexteditor/JS/plugins/all/plugin.js";

// ライセンスキーの設定
InputMan.LicenseKey = import.meta.env.VITE_INPUTMANJS_LICENSE_KEY || "";

// 新しいUIデザインの適用
InputMan.appearanceStyle = InputMan.AppearanceStyle.Modern;

// AIサービスの登録
GC.InputMan.ConfigurationManager.registerAIService(async (context) => {
  try {
    const controller = new AbortController();
    const { signal } = controller;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPrompt: context.input,
        systemPrompt: context.prompt,
        stream: true,
      }),
      signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    if (!res.body) {
      throw new Error(
        "この環境ではReadableStreamがサポートされていない、またはレスポンスボディがnullです。"
      );
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    try {
      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) {
          const chunkText = decoder.decode(value, { stream: !done });
          if (chunkText) context.streamWriter(chunkText);
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    throw error;
  }
});

// カスタムテーマのAI動作の登録
GC.InputMan.AI.GcTextAssistant.registerBehavior("changetocustomthemestyle", {
  prompt: `あなたはビジュアルデザインとレイアウトに精通したプロフェッショナルで、優れた美的センスをお持ちです。
    ただし、文面の言い換えや敬語表現の変更は行わず、入力された内容をそのまま使用してください。
    内容を理解した上で、以下の要件に従って色・フォント・レイアウトなどを適用し、文書をデザインしてください。

    # 目的
    - 提供されたテキストそのまま使用し、内容を追加・変更・削除しないでください。
    - インラインスタイルを使用して、文章を見やすく整えてください。
    - 情報の流れと整理を意識し、重要な情報は視覚的にわかりやすく強調してください。

    # レイアウトとスタイルの制約
    - すべてのスタイルはインラインスタイルで指定してください。
    - 新規画像・外部リソースの追加は禁止です。
    - アニメーション（GIF・CSSを含む）は禁止です。
    - ルートコンテナは1つにし、divを複数層にネストしないでください。
    - すべての要素の幅と高さは100%に設定してください。
    - fixed width・min-width・white-space:nowrapなど、コンテナが拡大する原因となる記法は使用しないでください。
    - 画像・表・装飾ブロックなどはすべてコンテナの幅に収め、横スクロールが発生しないようにしてください。

    # 補足
    - 短い情報の場合は、シンプルにまとめ、細かく分割したり過度に装飾したりしないでください。柔らかい背景や淡い点線枠などで重点を際立たせ、読みやすく整えてください。
    - 長い文章の場合は、内容のまとまりに応じて自然な段落に分割し、読みやすさとデザインの質を高めてください。ただし、文の途中で区切らないでください。
    - 画像が中心の場合は、1行に1枚ずつ配置してください。背景色や装飾枠を加えてもかまいませんが、リンクを壊さず、説明文は追加しないでください。

    # スタイル
    誰にでも安心感を与えるほのぼのとした可愛いスタイルです。

    # 特徴：
    柔らかく、安心感のある優しい雰囲気のスタイルです。
    # デザイン要素：
    - 色：やわらかい色調（ベビーピンク・スカイブルー・ミントグリーン・クリームイエロー）を基調とします。
    - フォント：丸ゴシック体など、角の取れた柔らかい書体のフォントを使用してください。
    - 背景：彩度を抑えたグラデーション、薄い半透明のベース、淡い水彩調の質感のいずれかを背景に使用してください。
    - イラスト：木や葉、木の実、自然模様などを水彩やクレヨンや水彩で描いたような手描き風のイラストで使用してください。
    - 装飾：ふわふわした雲形の囲み枠、小さな星やハートなどを組み合わせてください。
    # 適した用途：
    案内状・手帳・ノート

    # 出力形式
    - エディタにそのまま貼り付けられるHTMLを出力してください。
    - Markdown・コードコメント・styleタグ・scriptタグ・説明文は含めないでください。

    # 以下が対象テキストです:`,
});

// リッチテキストエディタの作成
const gcRichTextEditor = new GC.InputMan.GcRichTextEditor(
  document.getElementById("gcRichTextEditor1"),
  {
    plugins: [InputMan.GcRichTextEditorPluginItem.All],
    AITextAssistantConfig: {
      behaviorConfig: {
        dialogConfig: { width: 800, height: 500, }
      },
      menuItems: [
        { "name": GC.InputMan.AI.GcTextAssistantBehavior.GenerateText },
        { "name": GC.InputMan.AI.GcTextAssistantBehavior.ReviseText },
        { "name": GC.InputMan.AI.GcTextAssistantBehavior.SummarizeContent },
        { "name": GC.InputMan.AI.GcTextAssistantBehavior.ExpandContent },
        { "name": GC.InputMan.AI.GcTextAssistantBehavior.SimplifyContent },
        {
          "text": "口調を変更",
          "subAIBehaviorItems": [
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToProfessionalTone },
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToCasualTone }
          ]
        },
        {
          "text": "スタイルを変更",
          "subAIBehaviorItems": [
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToBusinessStyle },
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToTechnicalStyle }
          ]
        },
        {
          "text": "翻訳",
          "subAIBehaviorItems": [
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.TranslateToJapanese },
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.TranslateToEnglish }
          ]
        },
        {
          "text": "テーマを変更",
          "subAIBehaviorItems": [
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToBasicThemeStyle },
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToBusinessThemeStyle },
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToTechnologicalThemeStyle },
            { "name": GC.InputMan.AI.GcTextAssistantBehavior.ChangeToArtisticThemeStyle },
            // テーマ変更メニューにカスタムテーマを追加
            { "name": "changetocustomthemestyle", "text": "カスタムテーマ", "selection": true }
          ]
        }]
    },
    toolbar: [
      InputMan.GcRichTextEditorToolbarItem.AITextAssistant,
      InputMan.GcRichTextEditorToolbarItem.SeparateLine,
      InputMan.GcRichTextEditorToolbarItem.Undo,
      InputMan.GcRichTextEditorToolbarItem.Redo,
      InputMan.GcRichTextEditorToolbarItem.SeparateLine,
      InputMan.GcRichTextEditorToolbarItem.Styles,
      InputMan.GcRichTextEditorToolbarItem.Bold,
      InputMan.GcRichTextEditorToolbarItem.Italic,
      InputMan.GcRichTextEditorToolbarItem.Underline,
      InputMan.GcRichTextEditorToolbarItem.SeparateLine,
      InputMan.GcRichTextEditorToolbarItem.AlignCenter,
      InputMan.GcRichTextEditorToolbarItem.AlignJustify,
      InputMan.GcRichTextEditorToolbarItem.AlignLeft,
      InputMan.GcRichTextEditorToolbarItem.SeparateLine,
      InputMan.GcRichTextEditorToolbarItem.Indent,
      InputMan.GcRichTextEditorToolbarItem.Outdent,
    ],
    menubar: ["AI"],
    menu: { AI: { title: "AI文章作成アシスタント", items: ["aitextassistant"], }, },
    width: 1200,
    height: 700,
    setup: (editor) => {
      editor.addContextToolbar("textselection", {
        items: [GC.InputMan.GcRichTextEditorToolbarItem.AITextAssistant,],
        predicate: (node) => editor.getSelection(),
        position: "selection",
      });
    },
  }
);