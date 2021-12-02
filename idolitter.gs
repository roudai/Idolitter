var endpoint2 = "https://api.twitter.com/2/tweets";

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
  var response = twitter.getService().fetch(endpoint2, options);
  Logger.log(response)
}

function generatePostMessage(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("アイドル一覧");
  var rand = Math.floor( Math.random() * (sh.getLastRow() - 2) + 2 )

  var group = sh.getRange(rand,1).getValue();
  var name = sh.getRange(rand,7).getValue();
  var twitterID = sh.getRange(rand,6).getValue();

  var url = "https://api.twitter.com/2/users/by?usernames=" + twitterID + "&expansions=pinned_tweet_id";
  var options = {
    "method": "get",
    "headers": {
      "authorization": "Bearer " + PropertiesService.getScriptProperties().getProperty('BearerToken')
    },
  };
  var response = JSON.parse(UrlFetchApp.fetch(url, options));
  var pinned = "https://twitter.com/" + twitterID + "/status/" + response["data"][0]["pinned_tweet_id"]

  return group + ' | ' + name + ' @' + twitterID + ' ' + pinned;
}