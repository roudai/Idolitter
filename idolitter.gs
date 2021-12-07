function postUpdateStatus() {
  const postInfo = generatePostMessage()
  const message = postInfo[0];
  const userId = [postInfo[1]]
  
  // ツイート
  client.postTweet(message)
  // フォロー
  //client.createFollow('1458460477630353409', userId)
}

function generatePostMessage(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("アイドル一覧");
  const rand = Math.floor(Math.random() * (sh.getLastRow() - 2) + 2);

  const group = sh.getRange(rand,1).getValue();
  const twitterID = sh.getRange(rand,6).getValue();
  Logger.log(twitterID);

  const response = client.UsersLookupUsernames([twitterID],"pinned_tweet_id");

  const name = response["data"][0]["name"].replace("@"," ");
  const id = response["data"][0]["id"];
  const pinned_tweet_id = response["data"][0]["pinned_tweet_id"];

  let tweet;
  if (pinned_tweet_id){
    // 固定ツイート
    tweet = "https://twitter.com/" + twitterID + "/status/" + pinned_tweet_id;
  } else {
    // 固定ツイートがない場合、最新ツイート
    const response = client.getTimeLine(id, 100, false)
    tweet = "https://twitter.com/" + twitterID + "/status/" + response["tweet"][0][0];
  }
  if(name.match(group)){
    return [name + ' ' + tweet, id];
  }else{
    return [name + ' | ' + group + ' ' + tweet, id];
  }
}

function checkAccount() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('アイドル一覧');

  // データ並び替え
  sheet.getRange(2,1,sheet.getLastRow() - 1, sheet.getLastColumn()).sort([{column: 1, ascending: true},{column: 6, ascending: true}]);
  const lastRow = sheet.getLastRow();

  let errorID = [];
  let newID = [];
  // 100件ごとにTwitter情報取得
  for(var i = 1; i <= lastRow; i = i + 100){
    var getNum;
    if(lastRow - i - 1 >= 100 || lastRow % 100 == 1){
      getNum = 100;
    }else if(lastRow % 100 == 0){
      getNum = 99;
    }else{
      getNum = lastRow % 100 - 1;
    }
    if(!getTwitterPass(sheet.getRange(i + 1,6,getNum,1).getValues().join())){
      // 100件で失敗した場合、10件ごとに取得
      for(var j = 0; j < 100 ; j = j + 10){
        if(lastRow - i - j >= 10 || lastRow % 10 == 1){
          getNum = 10;
        }else if(lastRow % 10 == 0){
          getNum = 9;
        }else{
          getNum = lastRow % 10 - 1;
          if(getNum < 0){getNum = 9}
        }
        if(!getTwitterPass(sheet.getRange(i + j + 1,6,getNum,1).getValues().join())){
          // 10件で失敗した場合、1件ずつ取得
          for(var k = 0; k < 10; k = k + 1){
            if(!getTwitterPass(sheet.getRange(i + j + k + 1,6).getValue(), errorID)){
              var twitterID = sheet.getRange(i + j + k + 1,6,getNum,1).getValue();
              var twitterName = sheet.getRange(i + j + k + 1,7,getNum,1).getValue();
              var group = sheet.getRange(i + j + k + 1,1,getNum,1).getValue();
              if(getTwitterChange(sheet.getRange(i + j + k + 1,12,getNum,1).getValue(), newID)){
                if(name.match(group)){
                  client.postTweet("【ユーザー名変更】" + twitterName + ' ' + twitterID + ' ⇒ ' + newID[0]);
                }else{
                  client.postTweet("【ユーザー名変更】" + twitterName + ' | ' + group + ' ' + twitterID + ' ⇒ ' + newID[0]);
                }
              } else {
                if(name.match(group)){
                  client.postTweet("【アカウント削除】" + twitterName + ' ' + twitterID);
                }else{
                  client.postTweet("【アカウント削除】" + twitterName + ' | ' + group + ' ' + twitterID);
                }
              };
            }
          }
        }
      }
    }
  }
}

function getTwitterPass(twitterIDs, errorID = null){
  const response = client.UsersLookupUsernames([twitterIDs]);
  if(response["errors"]){
    if(!twitterIDs.match(/,/)){
      errorID.push(response["errors"][0]["value"]);
    }
    return false;
  }
  return true;
}

function getTwitterChange(userID, newID){
  const response = client.UsersLookupId(userID);
  if(response["errors"]){
    return false;
  }
  newID.push(response["data"]["username"]);
  return true;
}