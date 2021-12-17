function postUpdateStatus() {
  const postInfo = generatePostMessage()
  const message = postInfo[0];
  const userId = [postInfo[1]]
  
  // ツイート
  client.postTweet(message)
  // フォロー
  client.createFollow('1458460477630353409', userId)
}

function generatePostMessage(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("アイドル一覧");
  const rand = Math.floor(Math.random() * (sh.getLastRow() - 2) + 2);

  const group = sh.getRange(rand,1).getValue();
  const twitterID = sh.getRange(rand,6).getValue();
  Logger.log(twitterID);

  const response = client.UsersLookupUsernames([twitterID],"pinned_tweet_id");

  const name = response["data"][0]["name"].replace("@"," ").replace("＠"," ");
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

  checkDeleteAccount(sheet, lastRow);

  let errorID = [];
  let newID = [];
  let getNum;
  // 100件ごとにTwitter情報取得
  for(let i = 1; i <= lastRow; i = i + 100){
    getNum = getNum_100(i, lastRow);
    if(getTwitterPass(sheet.getRange(i + 1,6,getNum,1).getValues().join())){
      // 100件で成功した場合、次のループ
      continue;
    }
    // 100件で失敗した場合、10件ごとに取得
    for(let j = 0; j < 100 ; j = j + 10){
      getNum = getNum_10(i, j, lastRow);
      if(getTwitterPass(sheet.getRange(i + j + 1,6,getNum,1).getValues().join())){
        // 10件で成功した場合、次のループ
        continue;
      }
      // 10件で失敗した場合、1件ずつ取得
      for(let k = 0; k < 10; k = k + 1){
        if(getTwitterPass(sheet.getRange(i + j + k + 1,6).getValue(), errorID)){
          // 1件で成功した場合、次のループ
          continue;
        }
        if(sheet.getRange(i + j + k + 1,14,1,1).getValue()){
          // ツイート済みの場合、次のループ
          continue;
        }
        let twitterID = sheet.getRange(i + j + k + 1,6,1,1).getValue();
        let twitterName = sheet.getRange(i + j + k + 1,7,1,1).getValue();
        let group = sheet.getRange(i + j + k + 1,1,1,1).getValue();
        let userID = sheet.getRange(i + j + k + 1,12,1,1).getValue();
        if(userID){
          if(getTwitterChange(userID, newID)){
            if(nameGroupMatch(twitterName,group)){
              client.postTweet("【ユーザー名変更】" + twitterName + ' ' + twitterID + ' ⇒ ' + newID[0]);
            }else{
              client.postTweet("【ユーザー名変更】" + twitterName + ' (' + group + ') ' + twitterID + ' ⇒ ' + newID[0]); 
            }
            sheet.getRange(i + j + k + 1,6,1,1).setValue(newID[0]);
            newID = [];
          } else {
            if(nameGroupMatch(twitterName,group)){
              client.postTweet("【アカウント削除】" + twitterName + ' ' + twitterID);
            }else{
              client.postTweet("【アカウント削除】" + twitterName + ' (' + group + ') ' + twitterID);
            }
            sheet.getRange(i + j + k + 1,14,1,1).setValue("削除");
          }
        }else{
          if(nameGroupMatch(twitterName,group)){
            client.postTweet("【アカウント所在不明】" + twitterName + ' ' + twitterID);
          }else{
            client.postTweet("【アカウント所在不明】" + twitterName + ' (' + group + ') ' + twitterID);
          }
          sheet.getRange(i + j + k + 1,14,1,1).setValue("不明");
        }
        
      }
    }
  }
}

function checkDeleteAccount(sheet, lastRow){
  const twitterStatus = sheet.getRange(2,14,lastRow,1).getValues()
  const twitterID = sheet.getRange(2,6,lastRow,1).getValues()

  let errorID = [];
  for(let i = 0; i < lastRow ; i = i + 1){
    if(twitterStatus[i] != ""){
      Logger.log(twitterID[i]);
      if(getTwitterPass(String(twitterID[i]), errorID)){
        // アカウントが存在した場合、削除を取り消し
        sheet.getRange(i + 2,14).setValue(null);
        let twitterName = sheet.getRange(i + 2,7).getValue();
        let group = sheet.getRange(i + 2,1).getValue();

        if(nameGroupMatch(twitterName,group)){
          client.postTweet("【アカウント復活】" + twitterName + ' ' + twitterID[i]);
        }else{
          client.postTweet("【アカウント復活】" + twitterName + ' (' + group + ') ' + twitterID[i]);
        }
      };
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

function replyTweet(){
  const now = new Date();
  const before5min_unix = now.getTime() - 60000; //ミリ秒なので(300秒*1000)
  const before5min = new Date(before5min_unix);

  let start_time = Utilities.formatDate(before5min, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  let response = client.findMentionTweet('1458460477630353409',start_time);
  Logger.log(response);
  
  let matchData = [];
  if(response["meta"]["result_count"] > 0){
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("アイドル一覧");
    const lastRow = sh.getLastRow();
    const group = sh.getRange(2,1,lastRow - 1,1).getValues();
    const lastname = sh.getRange(2,2,lastRow - 1,1).getValues();
    const name = sh.getRange(2,3,lastRow - 1,1).getValues();
    const lastnameRead = sh.getRange(2,4,lastRow - 1,1).getValues();
    const nameRead = sh.getRange(2,5,lastRow - 1,1).getValues();
    const twitterID = sh.getRange(2,6,lastRow - 1,1).getValues();
    const twitterName = sh.getRange(2,7,lastRow - 1,1).getValues();
    
    for(i = 0; i < response["meta"]["result_count"]; i++){
      const tweetID = response["data"][i]["id"];
      const message = response["data"][i]["text"].replace("@Idol_itter ","");
      if(message.length <= 10){
        for(let j = 1; j <= lastRow; j = j + 1){
          //名字
          if(String(lastname[j]).match(message)){
            matchData.push([group[j],twitterID[j],twitterName[j]]);
            continue;
          }
          //名前
          if(String(name[j]).match(message)){
            matchData.push([group[j],twitterID[j],twitterName[j]]);
            continue;
          }
          //名字読み
          if(String(lastnameRead[j]).match(message)){
            matchData.push([group[j],twitterID[j],twitterName[j]]);
            continue;
          }
          //名前読み
          if(String(nameRead[j]).match(message)){
            matchData.push([group[j],twitterID[j],twitterName[j]]);
            continue;
          }
        }
      }
      if(matchData.length == 0){
        continue;
      }
      const rand = Math.floor(Math.random() * matchData.length);
      const pickGroup = matchData[rand][0];
      const pickTwitterID = matchData[rand][1];
      const pickTwitterName = String(matchData[rand][2]);

      if(pickTwitterName.match(pickGroup)){
        client.postTweet(pickTwitterID + " " + pickTwitterName,tweetID);
      }else{
        client.postTweet(pickTwitterID + " " + pickTwitterName + " | " + pickGroup,tweetID);
      }
      matchData = [];
    }
  }
}