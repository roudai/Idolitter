function getAllInformation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('アイドル一覧');
  const diffSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('取得差分');

  // データ並び替え
  sheet.getRange(2,1,sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{column: 1, ascending: true},{column: 12, ascending: true}]);

  // 現データコピー
  if(sheet.getRange(2,7).getValue() != ""){
    sheet.getRange("A:A").copyTo(diffSheet.getRange("A:A"));
    sheet.getRange("F:I").copyTo(diffSheet.getRange("B:E"));
    diffSheet.getRange("A1:E1").setBackground('#adff2f');
  }

　// 最終行取得、現データ削除
  const lastRow = sheet.getLastRow();
  if(sheet.getFilter()){
     sheet.getFilter().remove();
  }
  sheet.getRange(2,7,lastRow - 1,7).clearContent();

  let twitterInfo = [];
  let getNum;
  // 100件ごとにTwitter情報取得
  for(let i = 1; i <= lastRow; i = i + 100){
    getNum = getNum_100(i, lastRow);
    if(getTwitterInformation(twitterInfo, sheet.getRange(i + 1,6,getNum,1).getValues().join(), i, getNum)){
      // 100件で成功した場合、次のループ
      continue;
    }
    // 100件で失敗した場合、10件ごとに取得
    for(let j = 0; j < 100 ; j = j + 10){
      getNum = getNum_10(i, j, lastRow);
      if(getTwitterInformation(twitterInfo, sheet.getRange(i + j + 1,6,getNum,1).getValues().join(), i + j, getNum)){
        // 10件で成功した場合、次のループ
        continue;
      }
      // 10件で失敗した場合、1件ずつ取得
      for(let k = 0; k < 10; k = k + 1){
        if(getTwitterInformation(twitterInfo, sheet.getRange(i + j + k + 1,6).getValue(), i + j + k, 1)){
          // 1件で成功した場合、次のループ
          continue;
        }
        // 1件で失敗した場合、nullをプッシュ、ログ出力
        twitterInfo.push([null,null,null,null,null,null,null])
        sheet.getRange(i + j + k + 1,1,1,12).setBackground('#00ffff');
        const pastTwitterID = sheet.getRange(i + j + k　+ 1,6).getValue()
        Logger.log("No." + (i + j + k + 1) + " " + pastTwitterID);
      }
    }
  }
  // 全データ貼り付け
  sheet.getRange(2,7,lastRow - 1,7).setValues(twitterInfo);

  // フィルター作成
  sheet.getRange(1,1,lastRow,14).createFilter();

  // データ集計-グループ
  const groupSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ集計-グループ');
  groupSheet.getRange("A1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,avg(H),count(A) group by A order by avg(H) desc label A 'グループ名',avg(H) '平均フォロワー数',count(A) 'メンバー数' format avg(H) '#'\")");
  groupSheet.getRange("E1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,max(H)/min(H),count(A) group by A order by max(H)/min(H) desc label A 'グループ名',max(H)/min(H) 'フォロワー数最大/最小',count(A) 'メンバー数' format max(H)/min(H) '#.00'\")");
  groupSheet.getRange("I1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,avg(I),count(A) group by A order by avg(I) desc label A 'グループ名',avg(I) '平均ツイート数',count(A) 'メンバー数' format avg(I) '#'\")");
  groupSheet.getRangeList(["A1:C1","E1:G1","I1:K1"]).setBackground('#ffd700');
  groupSheet.getRangeList(["A1:C1","E1:G1","I1:K1"]).setFontWeight("bold");

  // データ集計-個人
  const personSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ集計-個人');
  personSheet.getRange("A1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select B,count(B) group by B order by count(B) desc limit 30 label B '名字', count(B) '人数'\")");
  personSheet.getRange("D1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select C,count(C) group by C order by count(C) desc limit 30 label C '名前', count(C) '人数'\")");
  personSheet.getRange("G1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select D,count(D) group by D order by count(D) desc limit 30 label D '名字読み', count(D) '人数'\")");
  personSheet.getRange("J1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select E,count(E) group by E order by count(E) desc limit 30 label E '名前読み', count(E) '人数'\")");
  personSheet.getRange("M1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,G,F,H order by H desc limit 100 label A 'グループ名',G '名前',F 'Twitter ID',H 'フォロワー数'\")");
  personSheet.getRange("R1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,G,F,I order by I desc limit 100 label A 'グループ名',G '名前',F 'Twitter ID',I 'ツイート数'\")");
  personSheet.getRangeList(["A1:B1","D1:E1","G1:H1","J1:K1","M1:P1","R1:U1"]).setBackground('#ffd700');
  personSheet.getRangeList(["A1:B1","D1:E1","G1:H1","J1:K1","M1:P1","R1:U1"]).setFontWeight("bold");

  // 取得差分
  sheet.getRange("H:I").copyTo(diffSheet.getRange("F:G"));
  diffSheet.getRange("I1").setValue("=query($A$1:$G$" + lastRow + ",\"select A,B,C,D,F,F-D order by F-D desc label D '前フォロワー数', F '後フォロワー数', F-D 'フォロワー増減'\")");
  diffSheet.getRange("P1").setValue("=query($A$1:$G$" + lastRow + ",\"select A,B,C,E,G,G-E order by G-E desc label E '前ツイート数', G '後ツイート数', G-E 'ツイート増減'\")");
  diffSheet.getRangeList(["I1:N1","P1:U1"]).setBackground('#ffd700');
  diffSheet.getRangeList(["I1:N1","P1:U1"]).setFontWeight("bold");

  // ランキングツイート
  tweetRanking("follower");
  tweetRanking("tweet");
}

function getTwitterInformation(twitterInfo, twitterIDs, startRow, num){
  const response = client.UsersLookupUsernames([twitterIDs],null,"public_metrics,description,verified,protected");
  if(response["errors"]){
    return false;
  }
  
  for(let i = 0; i < num; i++){
    const name = response["data"][i]["name"];
    const followers_count = response["data"][i]["public_metrics"]["followers_count"];
    const tweet_count = response["data"][i]["public_metrics"]["tweet_count"];
    let verified = response["data"][i]["verified"];
    let protected = response["data"][i]["protected"];
    const id = response["data"][i]["id"];
    const description = response["data"][i]["description"].replace(/[\r\n]+/g," ");
    if (verified) {
      verified = "認証"
    } else {
      verified = ""
    };
    if (protected) {
      protected = "非公開"
    } else {
      protected = ""
    };
    twitterInfo.push([name,followers_count,tweet_count,verified,protected,id,description])
  }
  return true;
}

function tweetRanking(type){
  const date = new Date();
  const today = (date.getMonth() + 1) + "月" + (date.getDate() - 1) + "日";

  const diffSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('取得差分');
  let title,group,name,increase;
  if(type == "follower"){
    title = "【" + today + " フォロワー数増ランキング】" + "\n"
    group = diffSheet.getRange("I2:I11").getValues();
    name = diffSheet.getRange("K2:K11").getValues();
    increase = diffSheet.getRange("N2:N11").getValues();
  }else if(type == "tweet"){
    title = "【" + today + " ツイート数ランキング】" + "\n"
    group = diffSheet.getRange("P2:P11").getValues();
    name = diffSheet.getRange("R2:R11").getValues();
    increase = diffSheet.getRange("U2:U11").getValues();
  }

  let tweetId,response,tweet,rename,reincrease;
  for(let i = 0; i < 10; i++){
    if(!tweet){
      tweet = title;
    }
    rename = String(name[i]).replace("@"," ").replace("＠"," ");
    if(type == "follower"){
      reincrease = increase[i] + "人";
    }else if(type == "tweet"){
      reincrease = increase[i];
    }
    if(nameGroupMatch(name[i],group[i])){
      tweet = tweet + (i + 1) + "位 " + reincrease + " " + rename + "\n";
    }else{
      tweet = tweet + (i + 1) + "位 " + reincrease + " " + rename + " (" + group[i] + ")" + "\n";
    }
    if(tweet.length > 140){
      tweet = tweet.slice(0,tweet.indexOf((i + 1) + "位 "));
      if(tweetId == ""){
        response = client.postTweet(tweet);
      }else{
        response = client.postTweet(tweet, tweetId);
      }
      tweetId = response["data"]["id"];
      tweet = "";
      i = i - 1;
    }
  }
  client.postTweet(tweet, tweetId);
}