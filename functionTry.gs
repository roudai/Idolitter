function getAllInformation_try(){
  var lastError = null;
  for(var i = 0; i < 10; i++) {
    try {
      getAllInformation();
      return;
    } catch(e) {
      lastError = e;
      Logger.log(e);
    }
    Utilities.sleep(60000);
  }
  throw lastError;
}

function postUpdateStatus_try(){
  var lastError = null;
  for(var i = 0; i < 3; i++) {
    try {
      postUpdateStatus();
      return;
    } catch(e) {
      lastError = e;
      Logger.log(e);
    }
    Utilities.sleep(10000);
  }
  throw lastError;
}

function checkAccount_try() {
  var lastError = null;
  for(var i = 0; i < 3; i++) {
    try {
      checkAccount();
      return;
    } catch(e) {
      lastError = e;
      Logger.log(e);
    }
    Utilities.sleep(10000);
  }
  throw lastError;
}