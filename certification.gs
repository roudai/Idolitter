// 認証用インスタンス
var twitter = TwitterWebService.getInstance(
  't2OeW2IJiElPDHVZQwPKUUW2r',
  'Bc16P8UfRUJ5RGVNCy8w4BuiyU0AkIJgu5aze2FkuO1yA0TtUC'
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