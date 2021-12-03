function getAllInformation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('アイドル一覧');
  const diffSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('取得差分');

  // データ並び替え
  sheet.getRange(2,1,sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{column: 1, ascending: true},{column: 6, ascending: true}]);

  // 現データコピー
  sheet.getRange("A:A").copyTo(diffSheet.getRange("A:A"));
  sheet.getRange("F:I").copyTo(diffSheet.getRange("B:E"));
  diffSheet.getRange("A1:E1").setBackground('#adff2f');

　// 最終行取得、現データ削除
  var lastRow = sheet.getLastRow();
  if (sheet.getFilter()){
     sheet.getFilter().remove();
  }
  sheet.getRange(2,7,lastRow - 1,6).clearContent();

  var twitterInfo = [];
  // 100件ごとにTwitter情報取得
  for(var i = 1; i <= lastRow; i = i + 100){
    var getNum;
    if(lastRow - i - 1 >= 100 || lastRow % 100 - 1 == 0){
      getNum = 100;
    }else{
      getNum = lastRow % 100 - 1;
      if(getNum < 0){getNum = 99}
    }
    Logger.log(getNum)
    if(!getTwitterInformation(twitterInfo, sheet.getRange(i + 1,6,getNum,1).getValues().join(), i, getNum)){
      // 100件で失敗した場合、10件ごとに取得
      for(var j = 0; j < 100 ; j = j + 10){
        if(lastRow - i - j >= 10 || lastRow % 10 == 0){
          getNum = 10;
        }else{
          getNum = lastRow % 10 - 1;
          if(getNum < 0){getNum = 9}
        }
        if(!getTwitterInformation(twitterInfo, sheet.getRange(i + j + 1,6,getNum,1).getValues().join(), i + j, getNum)){
          // 10件で失敗した場合、1件ずつ取得
          for(var k = 0; k < 10; k = k + 1){
            if(!getTwitterInformation(twitterInfo, sheet.getRange(i + j + k + 1,6).getValue(), i + j + k, 1)){
              twitterInfo.push([null,null,null,null,null,null])
              sheet.getRange(i + j + k + 1,1,1,12).setBackground('#00ffff');
              Logger.log("No." + (i + j + k + 1) + " " + sheet.getRange(i + j + k　+ 1,6).getValue());
            }
          }
        }
      }
    }
  }
  // 全データ貼り付け
  sheet.getRange(2,7,lastRow - 1,6).setValues(twitterInfo);

  // フィルター作成
  sheet.getRange(1,1,lastRow,12).createFilter();

  // データ集計-グループ
  const groupSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ集計-グループ');
  groupSheet.getRange("A1").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,avg(H),count(A) group by A order by avg(H) desc label A 'グループ名',avg(H) '平均フォロワー数',count(A) 'メンバー数' format avg(H) '#'\")");
  groupSheet.getRange("E1").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,max(H)/min(H),count(A) group by A order by max(H)/min(H) desc label A 'グループ名',max(H)/min(H) 'フォロワー数最大/最小',count(A) 'メンバー数' format max(H)/min(H) '#.00'\")");
  groupSheet.getRange("I1").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,avg(I),count(A) group by A order by avg(I) desc label A 'グループ名',avg(I) '平均ツイート数',count(A) 'メンバー数' format avg(I) '#'\")");
  groupSheet.getRange("A1:C1").setBackground('#ffd700'); groupSheet.getRange("A1:C1").setFontWeight("bold");
  groupSheet.getRange("E1:G1").setBackground('#ffd700'); groupSheet.getRange("E1:G1").setFontWeight("bold");
  groupSheet.getRange("I1:K1").setBackground('#ffd700'); groupSheet.getRange("I1:K1").setFontWeight("bold");

  // データ集計-個人
  const personSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ集計-個人');
  personSheet.getRange("A1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select B,count(B) group by B order by count(B) desc limit 30 label B '名字', count(B) '人数'\")");
  personSheet.getRange("D1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select C,count(C) group by C order by count(C) desc limit 30 label C '名前', count(C) '人数'\")");
  personSheet.getRange("G1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select D,count(D) group by D order by count(D) desc limit 30 label D '名字読み', count(D) '人数'\")");
  personSheet.getRange("J1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select E,count(E) group by E order by count(E) desc limit 30 label E '名前読み', count(E) '人数'\")");
  personSheet.getRange("M1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,G,F,H order by H desc limit 100 label A 'グループ名',G '名前',F 'Twitter ID',H 'フォロワー数'\")");
  personSheet.getRange("R1").setValue("=query('アイドル一覧'!$A$1:$K$" + lastRow + ",\"select A,G,F,I order by I desc limit 100 label A 'グループ名',G '名前',F 'Twitter ID',I 'ツイート数'\")");
  personSheet.getRange("A1:B1").setBackground('#ffd700'); personSheet.getRange("A1:B1").setFontWeight("bold");
  personSheet.getRange("D1:E1").setBackground('#ffd700'); personSheet.getRange("D1:E1").setFontWeight("bold");
  personSheet.getRange("G1:H1").setBackground('#ffd700'); personSheet.getRange("G1:H1").setFontWeight("bold");
  personSheet.getRange("J1:K1").setBackground('#ffd700'); personSheet.getRange("J1:K1").setFontWeight("bold");
  personSheet.getRange("M1:P1").setBackground('#ffd700'); personSheet.getRange("M1:P1").setFontWeight("bold");
  personSheet.getRange("R1:U1").setBackground('#ffd700'); personSheet.getRange("R1:U1").setFontWeight("bold");

  // 取得差分
  sheet.getRange("H:I").copyTo(diffSheet.getRange("F:G"));
  diffSheet.getRange("I1").setValue("=query($A$1:$G$" + lastRow + ",\"select A,B,C,F-D order by F-D desc label F-D 'フォロワー増減'\")");
  diffSheet.getRange("N1").setValue("=query($A$1:$G$" + lastRow + ",\"select A,B,C,G-E order by G-E desc label G-E 'ツイート増減'\")");
  diffSheet.getRange("I1:L1").setBackground('#ffd700'); personSheet.getRange("I1:L1").setFontWeight("bold");
  diffSheet.getRange("N1:Q1").setBackground('#ffd700'); personSheet.getRange("N1:Q1").setFontWeight("bold");
}

function getTwitterInformation(twitterInfo, twitterIDs, startRow, num){
  var url = "https://api.twitter.com/2/users/by?usernames=" + twitterIDs + "&user.fields=public_metrics,description,verified,protected";
  var options = {
    "method": "get",
    "muteHttpExceptions" : true,
    "headers": {
      "authorization": "Bearer " + PropertiesService.getScriptProperties().getProperty('BearerToken')
    },
  };
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  if(response["errors"]){
    return false;
  }
  
  for(var i = 0; i < num; i++){
    var name = response["data"][i]["name"];
    var followers_count = response["data"][i]["public_metrics"]["followers_count"];
    var tweet_count = response["data"][i]["public_metrics"]["tweet_count"];
    var verified = response["data"][i]["verified"];
    if (verified) {verified = "認証"} else {verified = ""};
    var protected = response["data"][i]["protected"];
    if (protected) {protected = "非公開"} else {protected = ""};
    var description = response["data"][i]["description"].replace(/[\r\n]+/g," ");

    twitterInfo.push([name,followers_count,tweet_count,verified,protected,description])
  }
  return true;
}
