//トリガー作成
function setTrigger(){
  const next = new Date();
  //翌日00時00分00秒
  next.setDate(next.getDate() + 1);
  next.setHours(0);
  next.setMinutes(0);
  next.setSeconds(0);
  
  ScriptApp.newTrigger('getAllInformation_try').timeBased().at(next).create();
}

//トリガー削除
function delTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "getAllInformation_try"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}