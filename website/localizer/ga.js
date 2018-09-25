function L(s){
  if(s=="READ-ONLY") return "LÉAMH AMHÁIN";
  if(s=="Edit") return "Eagarthóireacht";
  if(s=="Dublin City University") return "Ollscoil Chathair Bhaile Átha Cliath";
  if(s=="Log out") return "Logáil amach";
  if(s=="Change your password") return "Athraigh do phasfhocal";
  if(s=="Registered user login") return "Úsáideoirí cláraithe";
  if(s=="Get an account") return "Cruthaigh cuntas duit féin";
  if(s=="Forgot your password?") return "Pasfhocal dearmadta?";
  if(s=="E-mail address") return "Seoladh ríomhphoist";
  if(s=="Password") return "Pasfhocal";
  if(s=="Log in") return "Logáil isteach";
  if(s=="Your termbases") return "Do chuid cnuasach";
  if(s=="You have no termbases yet.") return "Níl cnuasach ar bith agat go fóill.";
  if(s=="Create a termbase") return "Cruthaigh cnuasach";
  if(s=="Administration") return "Riarachán";
  if(s=="Users") return "Úsáideoirí";
  if(s=="Termbases") return "Cnuasaigh";
  if(s=="smart search") return "cuardach cliste";
  if(s=="starts like this") return "tosaíonn mar seo";
  if(s=="contains a word that starts like this") return "tiomsaíonn focal a thosaíonn mar seo";
  if(s=="contains this sequence of characters") return "tiomsaíonn an teaghrán seo de charachtair";
  if(s=="search in all languages") return "cuardaigh i ngach teangach";
  if(s=="search in:") return "cuardaigh i:";
  if(s=="sort by:") return "sórtáil de réir:";
  if(s=="Configuration") return "Cumrú";
  if(s=="Metadata") return "Meiteashonraí";
  if(s=="") return s;
  return s;
}

try {
  module.exports={
    L: L,
  }
} catch(e){}
