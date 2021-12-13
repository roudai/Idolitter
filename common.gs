function nameGroupMatch(name, group) {
  name = String(name);
  group = String(group);

  if(name.match(group)){
    return true;
  }else if(name.match(group.replace(" ","").replace("　",""))){
    return true;
  }else if(name.replace(" ","").replace("　","").match(group)){
    return true;
  }
  return false;
}
