function postUpdateStatus() {
  var message = {
    text: generatePostMessage()
  }
  var options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify(message)
  }
  // ツイートする
  // var response = twitter.getService().fetch("https://api.twitter.com/2/tweets", options);
  // Logger.log(response);
  Logger.log(message);
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
  var name = response["data"][0]["name"];
  var id = response["data"][0]["id"];
  var pinned_tweet_id = response["data"][0]["pinned_tweet_id"];
  Logger.log(name);

  if (pinned_tweet_id){
    // 固定ツイート
    var pinned_tweet = "https://twitter.com/" + twitterID + "/status/" + pinned_tweet_id;
    return name + ' | ' + group + ' ' + pinned_tweet;
  } else {
    // 固定ツイートがない場合、最新ツイート
    var url = "https://api.twitter.com/2/users/" + id + "/tweets?max_results=5";
    var response = JSON.parse(UrlFetchApp.fetch(url, options));
    var latestTweet = "https://twitter.com/" + twitterID + "/status/" + response["data"][0]["id"];
    return name + ' | ' + group + ' ' + latestTweet;
  }

  
}