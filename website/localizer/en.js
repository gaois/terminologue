function L(s){
  if(s=="only") return function(s){
    return "only "+s;
  };
  return s;
}

try {
  module.exports={
    L: L,
  }
} catch(e){}
