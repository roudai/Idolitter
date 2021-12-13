# Idolitter
いわゆる地下アイドルグループに所属するアイドルを監視するTwitter Bot

## 元ネタノート
[アイドルグループ800組・4000人を集計してみた](https://note.com/roudainet/n/n6c1082ae5781)  
[アイドルグループ800組・4000人を集計してみた 後編](https://note.com/roudainet/n/n69c151f82edf)  
[スプレッドシート](https://docs.google.com/spreadsheets/d/1-WiWZ9VZ9r9Pr8UoHNeEBKx0TDzIqlFeEfm8mJXYKfQ/edit#gid=1649831763)

## 動作環境
Google Apps Script、スプレッドシート

## 機能
### ランダムアイドル紹介
約2時間に1回、リストの中からアイドルを1名選び、引用リツイートとともに名前、グループ名をツイートする。

名前はツイッター登録名。名前の中にグループ名が記載されている場合は、グループ名は重ねてツイートしない。

引用リツイート元は固定ツイートに登録されているツイート。固定ツイートがない場合は、最新ツイート（リツイート、返信ツイートを除く）

### アカウント監視
約1時間に1回、リスト内全アイドルのTwitterアカウントが生存しているかを確認する。アカウント名（「@」から始まるユーザー名）が変更された場合は、変更前、変更後のアカウント名をツイートする。削除された場合は、その旨をツイートする。タイミングによりどちらか判別できない場合は、所在不明とする。

### 日時フォロワー増加、ツイート数ランキング
毎日0時過ぎ（おそらく0時1分～2分頃）に、前日のフォロワー増加数、ツイート数のTOP10人の名前、グループ名をツイートする。各ランキングツイートは、140時以内に収まる範囲でいくつかのツイートに分かれてスレッド方式で投稿する。

ともにTwitter APIの結果を元に計算しているが、特にフォロワー数の取得結果が大きくズレることが稀によくあるため、信頼できないこともあるかもしれない。

### 名前検索返信
アカウント宛てに10文字以内の言葉を返信すると、そのことばが名字・名前（漢字、読み）に含まれるアイドルを1名選び、返信する。候補が複数名いる場合は、その中からランダムに1名を選ぶ。該当する名前がいない場合、または10文字を超える返信をした場合は何もしない。

返信があった場合は1分以内に返信されるが、タイミングによってされないかもしれない。

最大返信数は10件/1分。