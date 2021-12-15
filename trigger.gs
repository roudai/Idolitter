function checkAccount_try() {
  var lastError = null;
  for(var i = 0; i < 3; i++) {
    try {
      let response = checkAccount();
      if(response.getResponseCode() == 200) {
        return res.getContentText("UTF-8")
      } else {
        lastError = response.getResponseCode();
      }
    } catch(e) {
      lastError = e;
      Logger.log(e);
    }
    Utilities.sleep(3000);
  }
  throw lastError + ', ' + url
}