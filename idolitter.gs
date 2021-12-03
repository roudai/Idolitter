function postUpdateStatus() {
  var postInfo = generatePostMessage()

  // ツイート
  var message = {
    text: postInfo[0]
  }
  var options_tweet = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify(message)
  }
  var response = twitter.getService().fetch("https://api.twitter.com/2/tweets", options_tweet);
  Logger.log(response);

  // フォロー
  var target = {
    target_user_id: postInfo[1]
  }
  var options_follow = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify(target)
  }
  var response = twitter.getService().fetch("https://api.twitter.com/2/users/1458460477630353409/following", options_follow);
  Logger.log(response);
}

function generatePostMessage(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("アイドル一覧");
  var rand = Math.floor(Math.random() * (sh.getLastRow() - 2) + 2);

  var group = sh.getRange(rand,1).getValue();
  var twitterID = sh.getRange(rand,6).getValue();

  var url = "https://api.twitter.com/2/users/by?usernames=" + twitterID + "&expansions=pinned_tweet_id";
  var options = {
    "method": "get",
    "headers": {
      "authorization": "Bearer " + PropertiesService.getScriptProperties().getProperty('BearerToken')
    },
  };
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var name = response["data"][0]["name"].replace("@"," ");
  var id = response["data"][0]["id"];
  var pinned_tweet_id = response["data"][0]["pinned_tweet_id"];

  if (pinned_tweet_id){
    // 固定ツイート
    var pinned_tweet = "https://twitter.com/" + twitterID + "/status/" + pinned_tweet_id;
    return [name + ' | ' + group + ' ' + pinned_tweet, id];
  } else {
    // 固定ツイートがない場合、最新ツイート
    var url = "https://api.twitter.com/2/users/" + id + "/tweets?max_results=100";
    var response = JSON.parse(UrlFetchApp.fetch(url, options));
    for(var i = 0; i <= 100; i = i + 1){
      if(!response["data"][i]["text"].match(/@/)){
        var latestTweet = "https://twitter.com/" + twitterID + "/status/" + response["data"][i]["id"];
        return [name + ' | ' + group + ' ' + latestTweet, id];
      }
    }
  }
}