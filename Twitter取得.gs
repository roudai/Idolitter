function Twitter取得() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('アイドル一覧');
   
  SpreadsheetApp.getActiveSpreadsheet().deleteSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('アイドル一覧Prev'));
  sheet.copyTo(SpreadsheetApp.getActiveSpreadsheet()).setName("アイドル一覧Prev");
  
  if(sheet.getRange("A1").getValue() == "グループ名"){
    sheet.deleteRow(1)
  }
  let lastRow = sheet.getLastRow();

  for(let i = 1; i <= lastRow; i = i + 100){
    let getNum
    if(lastRow - i >= 100 || lastRow % 100 == 0){
      getNum = 100;
    }else{
      getNum = lastRow % 100;
    }
    if(!getUserInformation(sheet.getRange(i,6,getNum,1).getValues().join(), i, getNum)){
      for(let j = 0; j < 100 ; j = j + 10){
        if(lastRow - i - j >= 10 || lastRow % 10 == 0){
          getNum = 10
        }else{
          getNum = lastRow % 10
        }
        if(!getUserInformation(sheet.getRange(i + j ,6,getNum,1).getValues().join(), i + j, getNum)){
          for(let k = 0; k < 10; k = k + 1){
            if(!getUserInformation(sheet.getRange(i + j + k ,6).getValue(), i + j + k, 1)){
                sheet.getRange(i + j + k ,6).setBackground('#00ffff')
                Logger.log(sheet.getRange(i + j + k ,6).getValue())
            }
          }
        }
      }
    }
  }

  sheet.insertRowsBefore(1,1);
  sheet.getRange("A1:K1").setValues([['グループ名','名字','名前','名字読み','名前読み','TwitterID','TwitterName','フォロワー数','ツイート数','認証','Twitterプロフィール']]);
  sheet.getRange("A1:K1").setBackground('#ffd700');
  sheet.getRange(1,1,lastRow + 1,11).createFilter();

  const groupSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ集計-グループ');
  groupSheet.getRange("B2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,avg(H),count(A) group by A order by avg(H) desc label A 'グループ名',avg(H) '平均フォロワー数',count(A) 'メンバー数' format avg(H) '#'\")");
  groupSheet.getRange("F2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,max(H)/min(H),count(A) group by A order by max(H)/min(H) desc label A 'グループ名',max(H)/min(H) 'フォロワー数最大/最小',count(A) 'メンバー数' format max(H)/min(H) '#.00'\")");
  groupSheet.getRange("J2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,avg(I),count(A) group by A order by avg(I) desc label A 'グループ名',avg(I) '平均ツイート数',count(A) 'メンバー数' format avg(I) '#'\")");
  groupSheet.getRange("B2:D2").setBackground('#ffd700'); groupSheet.getRange("B2:D2").setFontWeight("bold");
  groupSheet.getRange("F2:H2").setBackground('#ffd700'); groupSheet.getRange("F2:H2").setFontWeight("bold");
  groupSheet.getRange("J2:L2").setBackground('#ffd700'); groupSheet.getRange("J2:L2").setFontWeight("bold");

  const personSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ集計-個人');
  personSheet.getRange("B2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select B,count(B) group by B order by count(B) desc limit 30 label B '名字', count(B) '人数'\")");
  personSheet.getRange("E2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select C,count(C) group by C order by count(C) desc limit 30 label C '名前', count(C) '人数'\")");
  personSheet.getRange("H2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select D,count(D) group by D order by count(D) desc limit 30 label D '名字読み', count(D) '人数'\")");
  personSheet.getRange("K2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select E,count(E) group by E order by count(E) desc limit 30 label E '名前読み', count(E) '人数'\")");
  personSheet.getRange("N2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,G,F,H order by H desc limit 100 label A 'グループ名',G '名前',F 'Twitter ID',H 'フォロワー数'\")");
  personSheet.getRange("S2").setValue("=query('アイドル一覧'!$A$1:$K$" + (lastRow + 1) + ",\"select A,G,F,I order by I desc limit 100 label A 'グループ名',G '名前',F 'Twitter ID',I 'ツイート数'\")");
  personSheet.getRange("B2:C2").setBackground('#ffd700'); personSheet.getRange("B2:C2").setFontWeight("bold");
  personSheet.getRange("E2:F2").setBackground('#ffd700'); personSheet.getRange("E2:F2").setFontWeight("bold");
  personSheet.getRange("H2:I2").setBackground('#ffd700'); personSheet.getRange("H2:I2").setFontWeight("bold");
  personSheet.getRange("K2:L2").setBackground('#ffd700'); personSheet.getRange("K2:L2").setFontWeight("bold");
  personSheet.getRange("N2:Q2").setBackground('#ffd700'); personSheet.getRange("N2:Q2").setFontWeight("bold");
  personSheet.getRange("S2:V2").setBackground('#ffd700'); personSheet.getRange("S2:V2").setFontWeight("bold");
}

function getUserInformation(twitterIDs, startRow, num){
  let url = "https://api.twitter.com/2/users/by?usernames=" + twitterIDs + "&user.fields=public_metrics,description,verified";
  let options = {
    "method": "get",
    "headers": {
      "authorization": "Bearer " + PropertiesService.getScriptProperties().getProperty('BearerToken')
    },
  };
  let response = JSON.parse(UrlFetchApp.fetch(url, options));
  if(response["errors"]){
    return false;
  }
  let twitterInfo = [];
  for(let i = 0; i < num; i++){   
    let name = response["data"][i]["name"];
    let followers_count = response["data"][i]["public_metrics"]["followers_count"];
    let tweet_count = response["data"][i]["public_metrics"]["tweet_count"];
    let verified = response["data"][i]["verified"]
    if (verified) {verified = "認証"} else {verified = ""}
    let description = response["data"][i]["description"].replace(/[\r\n]+/g," ");

    twitterInfo.push([name,followers_count,tweet_count,verified,description])
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('アイドル一覧').getRange(startRow,7,num,5).setValues(twitterInfo);
  return true;
}
