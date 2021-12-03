// 認証用インスタンス
var twitter = TwitterWebService.getInstance(
  PropertiesService.getScriptProperties().getProperty('consumer_key'),
  PropertiesService.getScriptProperties().getProperty('consumer_secret')
);

// 認証
function authorize() {
  twitter.authorize();
}

// 認証解除
function reset() {
  twitter.reset();
}

// 認証後のコールバック
function authCallback(request) {
  return twitter.authCallback(request);
}