# 京橋内科医院 現行デザインAstro検証版

2026年9月27日時点の公開WordPressサイトを、Astroの静的サイトとして再構成する検証プロジェクトです。既存の文言、画像、ページURL、白と緑を基調としたレイアウトを可能な範囲で保持し、本文はMarkdownで管理します。

レビュー用の公開URL: https://kemaruya.github.io/kmc-current-astro-20260927/

このリポジトリとGitHub Pagesは公開されています。検索エンジンには `noindex, nofollow` を指定していますが、閲覧制限ではありません。本番サイト、DNS、WordPress、既存の7月版・9月版GitHub Pagesは変更していません。

## 編集

本文は `src/content/pages/*.md` を編集します。ヘッダー、フッター、診療時間、ナビゲーションは `src/layouts/SiteLayout.astro`、デザインは `src/styles/global.css` です。

```powershell
npm install
npm run dev
npm run check
```

`npm run check` は静的ビルド後に、主要6ページ、トップの必須案内、ページ別の画像構成、全ページのGoogle Maps埋め込み、WordPress素材への参照が残っていないこと、入力フォームが追加されていないことを検証します。

## 現行デザインの再現

- 本文・ナビゲーション・見出しには、文字種や端末による書体差が出にくいNoto Sans JP Variableを自己ホストして使用します。Fontsourceで配布されるフォントです。
- 下層5ページには、現行サイトと同じ元画像を使った高さ200pxのページバナーがあります。
- 医院紹介は挨拶中の2写真と3列×2段の院内写真、診療内容は4分類の小図14点と説明図2点、アクセスは写真・案内図の2列を再現します。
- 全ページの最下部に、現行サイトと同じGoogle Mapsの地図を直接埋め込みます。地図面をクリック・タップするとGoogle Mapsを新しいタブで開きます。フッターの地図には画像へのフォールバックや切替ボタンはありません。アクセスページ本文の写真・案内図とGoogle・Apple・Yahoo!への地図リンクは引き続き掲載しています。
- Google Mapsの埋め込みにより、各ページを開くとGoogleへの外部通信が発生します。地図タイルの表示はGoogleと利用環境に依存します。
- フォントと画像はローカル資産から配信します。

## CI/CD

- `.github/workflows/ci.yml`: `main`へのpushとPull Requestでビルド・静的検証を実行します。
- `.github/workflows/deploy-preview.yml`: `main`へのpushでビルド・検証後にGitHub Pagesへ自動反映します。GitHub Actionsからの手動再公開もできます。
- 検証公開では `noindex, nofollow` を維持します。将来の本番ビルドだけ `PUBLIC_SITE_ENV=production` を指定します。
- リポジトリのSettings > PagesでBuild and deploymentのSourceはGitHub Actionsです。レビュー版を本番ドメインへ向ける設定はありません。

## 移行元

下層5ページは、既存の `D:\src\kmc-renewal-202609\content` に保存された2026年9月7日の公開本文スナップショットからMarkdownへ変換しました。トップは2026年9月27日の公開状態を確認し、9月13日に追加されたインフルエンザ案内を含めています。医院紹介や診療内容のMarkdownには、写真・図版のまとまりを保つHTMLの囲いがあります。

```powershell
npm run import:content -- "D:\src\kmc-renewal-202609\content"
```

このインポートコマンドは下層5ページのMarkdownを上書きします。手作業で文章を編集した後には通常実行しないでください。指定ページだけを再取得する場合は末尾に `about medical access` のようにページIDを追加できます。

公開サイト由来の写真・図版は検証目的で使用しています。出典は [ASSET-SOURCES.md](ASSET-SOURCES.md) に記録しています。本公開前に利用権、現況、医療広告表現、資格・提携先、診療運用を医院で確認してください。玄関写真には現在の本文と異なる古い診療時間が写っており、周辺案内図にも過去の工事表示があります。公開前に画像の更新が必要です。
