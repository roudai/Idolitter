# Idolitter
いわゆる地下アイドルグループに所属するアイドルを監視するTwitter Bot

## Twitterアカウント
[@Idol_itter](https://twitter.com/Idol_itter)

アイコン提供：[@w_ty_OvO](https://twitter.com/w_ty_OvO)

## 元ネタノート
[アイドルグループ800組・4000人を集計してみた](https://note.com/roudainet/n/n6c1082ae5781)  
[アイドルグループ800組・4000人を集計してみた 後編](https://note.com/roudainet/n/n69c151f82edf)  
[スプレッドシート](https://docs.google.com/spreadsheets/d/1-WiWZ9VZ9r9Pr8UoHNeEBKx0TDzIqlFeEfm8mJXYKfQ/edit#gid=1649831763)

## 動作環境
Google Apps Script、スプレッドシート

## 機能
### ランダムアイドル紹介
約2時間に1回、リストの中からアイドルを1名選び、引用リツイートとともに名前、グループ名をツイートする。同時に、ツイートしたアイドルをフォローする。

名前はツイッター登録名。名前の中にグループ名が記載されている場合は、グループ名は重ねてツイートしない。

引用リツイート元は固定ツイートに登録されているツイート。固定ツイートがない場合は、最新ツイート（リツイート、返信ツイートを除く）

### アカウント監視
約1時間に1回、リスト内全アイドルのTwitterアカウントが生存しているかを確認する。アカウント名（「@」から始まるユーザー名）が変更された場合は、変更前、変更後のアカウント名をツイートする。削除された場合は、その旨をツイートする。タイミングによりどちらか判別できない場合は、所在不明とする。

### 日時フォロワー増加、ツイート数ランキング
毎日0時過ぎ（おそらく0時1分～2分頃）に、前日のフォロワー増加数、ツイート数の上位10人の名前、グループ名をツイートする。各ランキングツイートは、140字以内に収まる範囲でいくつかのツイートに分かれてスレッド方式で投稿する。

ともにTwitter APIの結果を元に計算しているが、特にフォロワー数の取得結果が大きくズレることが稀によくあるため、信頼できないこともあるかもしれない。

## 情報提供のお願い
アイドルグループ、所属アイドルの情報を随時募集しています。下記スプレッドシートに記載されていない、または既に解散してしまったグループ、脱退、卒業、解雇等で既にいないメンバー、新メンバーの情報等募集しています。  
下記投稿フォーム、またはツイッターアカウントへの返信、DMでも情報提供をお待ちしています。

[投稿フォーム](https://forms.gle/LgtmavksDADbR8uLA)

