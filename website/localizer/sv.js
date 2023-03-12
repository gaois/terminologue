﻿function L(s, gloss){
  if(s=="only") return function(s){
    return s+" endast";
  };
  if(s=="READ-ONLY") return "READ-ONLY";
  if(s=="Editing") return "Redigering";
  if(s=="Dublin City University") return "Dublin City University";
  if(s=="Log out") return "Logga ut";
  if(s=="Change your password") return "Ändra ditt lösenord";
  if(s=="Registered user login") return "Inloggning för registrerade användare";
  if(s=="Get an account") return "Skaffa ett konto";
  if(s=="Forgot your password?") return "Glömt ditt lösenord?";
  if(s=="E-mail address") return "E-postadress";
  if(s=="Password") return "Lösenord";
  if(s=="Log in") return "Logga in";
  if(s=="Your termbases") return "Dina termbanker";
  if(s=="You have no termbases yet.") return "Du har inga termbanker än.";
  if(s=="Create a termbase") return "Skapa en termbank";
  if(s=="Administration") return "Administration";
  if(s=="Users") return "Användare";
  if(s=="Termbases") return "Termbanker";
  if(s=="smart search") return "smart sökning";
  if(s=="complete term") return "hela termen";
  if(s=="start of term") return "början av termen";
  if(s=="end of term") return "slutet av termen";
  if(s=="any part of term") return "vilken del av termen som helst";
  if(s=="any part except start or end") return "vilken del av termen som helst utom början eller slut";
  if(s=="search in all languages") return "sök på alla språk";
  if(s=="Configuration") return "Konfiguration";
  if(s=="ADMIN") return "ADMIN";
  if(s=="TRM") return "TRM";
  if(s=="DOM") return "DOM";
  if(s=="DEF") return "DEF";
  if(s=="XMPL") return "XMPL"
  if(s=="CHECKING STATUS") return "KONTROLLSTATUS";
  if(s=="PUBLISHING STATUS") return "PUBLICERINGSSTATUS";
  if(s=="TERMS") return "TERMER";
  if(s=="DOMAINS") return "DOMÄNER";
  if(s=="term") return "term";
  if(s=="clarification") return "förtydligande";
  if(s=="acceptability") return "acceptansnivå";
  if(s=="source") return "källa";
  if(s=="inflected form") return "böjningsform";
  if(s=="annotation") return "annotering";
  if(s=="domain") return "domän";
  if(s=="part of speech") return "ordklass";
  if(s=="inflection") return "böjning";
  if(s=="language of origin") return "originalspråk";
  if(s=="symbol") return "symbol";
  if(s=="trademark") return "varumärke";
  if(s=="registered trademark") return "registrerat varumärke";
  if(s=="proper noun") return "egennamn";
  if(s=="formatting") return "formatering";
  if(s=="italic") return "kursiv";
  if(s=="Created") return "Skapad";
  if(s=="Changed") return "Ändrad";
  if(s=="Deleted") return "Borttagen";
  if(s=="Bulk-deleted") return "Satsvis borttagen";
  if(s=="while uploading") return "medan uppladdning sker";
  if(s=="By") return "Av";
  if(s=="When") return "När";
  if(s=="any checking status") return "vilken kontrollstatus som helst";
  if(s=="any publishing status") return "vilken publiceringsstatus som helst";
  if(s=="any language") return "vilket språk som helst";
  if(s=="any acceptability or no acceptability") return "vilken acceptansnivå som helst eller ingen acceptansnivå";
  if(s=="any acceptability") return "vilken acceptansnivå som helst";
  if(s=="no acceptability") return "ingen acceptansnivå";
  if(s=="any domain or no domain") return "vilken domän som helst eller ingen domän";
  if(s=="any domain") return "vilken domän som helst";
  if(s=="no domain") return "ingen domän";
  if(s=="LAST MAJOR UPDATE") return "SENASTE STÖRRE UPPDATERING";
  if(s=="set to today") return "använd dagens datum";
  if(s=="Invalid e-mail address or password.") return "Ogiltig e-postadress eller ogiltigt lösenord.";
  if(s=="INTR") return "DIS";
  if(s=="COLL") return "SAML";
  if(s=="INTROS") return "DISAMBIGUERARE";
  if(s=="DEFINITIONS") return "DEFINITIONER";
  if(s=="EXAMPLES") return "EXEMPEL";
  if(s=="COLLECTIONS") return "SAMLINGAR";
  if(s=="definition") return "definition";
  if(s=="example") return "exempel";
  if(s=="sentence") return "mening";
  if(s=="collection") return "samling";
  if(s=="any collection or no collection") return "vilken samling som helst eller ingen samling";
  if(s=="any collection") return "vilken samling som helst";
  if(s=="no collection") return "ingen samling";
  if(s=="comments") return "kommentarer";
  if(s=="with or without comments") return "med eller utan kommentarer";
  if(s=="with comments") return "med kommentarer";
  if(s=="without comments") return "utan kommentarer";
  if(s=="my comments") return "mina kommentarer";
  if(s=="with or without my comments") return "med eller utan mina kommentarer";
  if(s=="with my comments") return "med mina kommentarer";
  if(s=="without my comments") return "utan mina kommentarer";
  if(s=="other people's comments") return "andras kommentarer";
  if(s=="with or without other people's comments") return "med eller utan andras kommentarer";
  if(s=="with other people's comments") return "med andras kommentarer";
  if(s=="without other people's comments") return "utan andras kommentarer";
  if(s=="EXTRANET") return "EXTRANÄT";
  if(s=="EXT") return "EXT";
  if(s=="EXTRANETS") return "EXTRANÄT";
  if(s=="extranet") return "extranät";
  if(s=="any extranet or no extranet") return "vilket extranät som helst eller inget extranät";
  if(s=="any extranet") return "vilket extranät som helst";
  if(s=="no extranet") return "inget extranät";
  if(s=="sorting language") return "sorteringsspråk";
  if(s=="Create mutual cross-references") return "Skapa dubbelriktade korsreferenser";
  if(s=="Remove mutual cross-references") return "Ta bort dubbelriktade korsreferenser";
  if(s=="Merge into a single entry") return "Slå ihop till en enda begreppspost";
  if(s=="SEE ALSO") return "SE ÄVEN";
  if(s=="add to worklist") return "lägg till i arbetslista";
  if(s=="Domains") return "Domäner";
  if(s=="Part-of-speech labels") return "Ordklassetiketter";
  if(s=="Inflection labels") return "Böjningsetiketter";
  if(s=="Acceptability labels") return "Acceptansnivåetiketter";
  if(s=="Sources") return "Källor";
  if(s=="Collections") return "Samlingar";
  if(s=="Tags") return "Färdigförberedda kommentarer";
  if(s=="Extranets") return "Extranät";
  if(s=="Name and blurb") return "Namn och förlagstext";
  if(s=="Features") return "Funktioner";
  if(s=="Languages") return "Språk";
  if(s=="Publishing") return "Publicering";
  if(s=="Change the termbase's URL") return "Ändra termbankens URL";
  if(s=="Delete the termbase") return "Radera termbanken";
  if(s=="TITLE") return "TITEL";
  if(s=="abbreviation") return "förkortning";
  if(s=="LANGUAGES") return "SPRÅK";
  if(s=="select all") return "välj alla";
  if(s=="unselect all") return "avmarkera alla";
  if(s=="PRIORITY") return "PRIORITET";
  if(s=="high") return "hög";
  if(s=="medium") return "medel";
  if(s=="low") return "låg";
  if(s=="USERS") return "ANVÄNDARE";
  if(s=="e-mail address") return "e-postadress";
  if(s=="user") return "användare";
  if(s=="Alphabetical order") return "Alfabetisk sorteringsordning";
  if(s=="Similar terms (click to insert)") return "Liknande termer (klicka för att klistra in)";
  if(s=="Other entries that share this term") return "Andra begreppsposter som delar denna term";
  if(s=="stop sharing") return "sluta dela";
  if(s=="Change checking status to") return "Ändra kontrollstatus till";
  if(s=="Change publishing status to") return "Ändra publiceringsstatus till";
  if(s=="Add to extranet") return "Lägg till i extranät";
  if(s=="Remove from extranet") return "Ta bort från extranät";
  if(s=="checked") return "kontrollerad";
  if(s=="not checked") return "inte kontrollerad";
  if(s=="publishable") return "publiceringsbar";
  if(s=="hidden") return "dold";
  if(s=="CHECKED") return "KONTROLLERAD";
  if(s=="NOT CHECKED") return "INTE KONTROLLERAD";
  if(s=="PUBLISHABLE") return "PUBLICERBAR";
  if(s=="HIDDEN") return "DOLD";
  if(s=="non-essential") return "icke-synlig";
  if(s=="STATUS") return "STATUS";
  if(s=="live") return "aktiverad";
  if(s=="not live") return "inaktiverad";
  if(s=="any clarification or no clarification") return "vilket förtydligande som helst eller inget förtydligande";
  if(s=="any clarification") return "vilket förtydligande som helst";
  if(s=="no clarification") return "inget förtydligande";
  if(s=="clarification containing...") return "förtydligande som innehåller...";
  if(s=="any intro or no intro") return "vilken disambiguerare som helst eller ingen disambiguerare";
  if(s=="any intro") return "vilken disambiguerare som helst";
  if(s=="no intro") return "ingen disambiguerare";
  if(s=="intro containing...") return "disambiguerare som innehåller...";
  if(s=="any definition or no definition") return "vilken definition som helst eller ingen definition";
  if(s=="any definition") return "vilken definition som helst";
  if(s=="no definition") return "ingen definition";
  if(s=="definition containing...") return "definition som innehåller...";
  if(s=="any example or no example") return "vilket exempel som helst eller inget exempel";
  if(s=="any example") return "vilket exempel som helst";
  if(s=="no example") return "inget exempel";
  if(s=="example containing...") return "exempel som innehåller...";
  if(s=="Automatic changes") return "Automatiska ändringar";
  if(s=="NAME") return "NAMN";
  if(s=="BLURB") return "FÖRLAGSTEXT";
  if(s=="level") return "nivå";
  if(s=="reader") return "läsvy";
  if(s=="editor") return "redigeringsvy";
  if(s=="creator") return "skapare";
  if(s=="administrator") return "administratör";
  if(s=="configurator") return "konfigurator";
  if(s=="no change") return "ingen ändring";
  if(s=="change to 'not checked'") return "ändra till ”inte kontrollerad”";
  if(s=="change to 'hidden'") return "ändra till ”dold”";
  if(s=="change to 'not checked' and 'hidden'") return "ändra till ”inte kontrollerad” och ”dold”";
  if(s=="LAST SEEN") return "SENAST VISAD";
  if(s=="NEVER") return "ALDRIG";
  if(s=="No termbases") return "Inga termbanker";
  if(s=="language") return "språk";
  if(s=="major") return "huvudspråk";
  if(s=="minor") return "bispråk";
  if(s=="role") return "roll";
  if(s=="title") return "titel";
  if(s=="ACCESS LEVEL") return "ÅTKOMSTNIVÅ";
  if(s=="LICENCE") return "LICENS";
  if(s=="private") return "privat";
  if(s=="public") return "offentlig";
  if(s=="trigger_dateStampChange") return "datum ändrat";
  if(s=="trigger_domainAdd") return "domän tillagd";
  if(s=="trigger_domainRemove") return "domän borttagen";
  if(s=="trigger_domainReorder") return "domäner omsorterade";
  if(s=="trigger_domainChange") return "domän ändrad";
  if(s=="trigger_desigAdd") return "term tillagd";
  if(s=="trigger_desigRemove") return "term borttagen";
  if(s=="trigger_desigReorder") return "termer omsorterade";
  if(s=="trigger_desigClarifChange") return "förtydligande tillagt";
  if(s=="trigger_desigAcceptChange") return "acceptansnivå tillagd";
  if(s=="trigger_termLangChange") return "termens språk tillagt";
  if(s=="trigger_termWordingChange") return "termformulering tillagd";
  if(s=="trigger_termInflectAdd") return "böjningsform tillagd";
  if(s=="trigger_termInflectRemove") return "böjningsform borttagen";
  if(s=="trigger_termInflectReorder") return "böjningsformer omsorterade";
  if(s=="trigger_termInflectLabelChange") return "angivelse av böjningsform ändrad";
  if(s=="trigger_termInflectTextChange") return "formulering av böjningsform ändrad";
  if(s=="trigger_termAnnotAdd") return "termannotering tillagd";
  if(s=="trigger_termAnnotRemove") return "termannotering borttagen";
  if(s=="trigger_termAnnotReorder") return "termannoteringar omsorterade";
  if(s=="trigger_termAnnotPositionChange") return "position för termannotering ändrad";
  if(s=="trigger_termAnnotLabelChange") return "termannoteringsetikett ändrad";
  if(s=="trigger_introChange") return "disambiguerare ändrad";
  if(s=="trigger_definitionAdd") return "definition tillagd";
  if(s=="trigger_definitionRemove") return "definition borttagen";
  if(s=="trigger_definitionReorder") return "definitioner omsorterade";
  if(s=="trigger_definitionTextChange") return "definition omformulerad";
  if(s=="trigger_exampleAdd") return "exempel tillagt";
  if(s=="trigger_exampleRemove") return "exempel borttaget";
  if(s=="trigger_exampleReorder") return "exempel omsorterade";
  if(s=="trigger_exampleTextAdd") return "exempelmening tillagd";
  if(s=="trigger_exampleTextRemove") return "exempelmening borttagen";
  if(s=="trigger_exampleTextReorder") return "exempelmeningar omsorterade";
  if(s=="trigger_exampleTextChange") return "exempelmening omformulerad";
  if(s=="trigger_collectionAdd") return "samling tillagd";
  if(s=="trigger_collectionRemove") return "samling borttagen";
  if(s=="trigger_collectionReorder") return "samlingar omsorterade";
  if(s=="trigger_collectionChange") return "samling ändrad";
  if(s=="trigger_extranetAdd") return "extranät tillagt";
  if(s=="trigger_extranetRemove") return "extranät borttaget";
  if(s=="trigger_extranetReorder") return "extranät omsorterade";
  if(s=="trigger_extranetChange") return "extranät ändrat";
  if(s=="trigger_sourceAdd") return "källa tillagd";
  if(s=="trigger_sourceRemove") return "källa borttagen";
  if(s=="trigger_sourceReorder") return "källor omsorterade";
  if(s=="trigger_sourceChange") return "källa ändrad";
  if(s=="trigger_nonessentialChange") return "synlighet ändrad";
  if(s=="(blank)") return "(tom)";
  if(s=="Simple Multilingual Termbase") return "Enkel flerspråkig termbank";
  if(s=="Simple Bilingual Termbase") return "Enkel tvåspråkig termbank";
  if(s=="Simple Monolingual Termbase") return "Enkel enspråkig termbank";
  if(s=="Enter a human-readable title such as \"My Dictionary of Sports Terms\". You will be able to change this later.") return "Skriv in en titel som t.ex. \"Min ordlista med sporttermer\". Du kan ändra denna titel senare.";
  if(s=="This will be your termbase's address on the web. You will be able to change this later.") return "Detta kommer att vara webbadressen till din termbank. Du kan ändra denna adress senare.";
  if(s=="You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.") return "Du kan börja genom att välja en mall. Varje mall innehåller ett antal exempelposter. Du kan ändra eller ta bort dessa och anpassa mallen.";
  if(s=="Your termbase is ready.") return "Din termbank är klar.";
  if(s=="TERM OF THE DAY") return "DAGENS TERM";
  if(s=="set to next available date") return "ange närmast tillgängliga datum";
  if(s=="Display from") return "Visa från";
  if(s=="Display until") return "Visa till";
  if(s=="News and announcements") return "Nyheter och meddelanden";
  if(s=="Create your account") return "Skapa ditt konto";
  if(s=="Reset your password") return "Återställ ditt lösenord";
  if(s=="Terminologue signup") return "Anmäl dig till Terminologue";
  if(s=="Please follow the link below to create your Terminologue account:") return "Följ länken nedan för att skapa ditt Terminologue-konto:";
  if(s=="Terminologue password reset") return "Återställning av Terminologue-lösenord";
  if(s=="Please follow the link below to reset your Terminologue password:") return "Följ länken nedan för att återstålla ditt Terminologue-lösenord:";
  if(s=="This page is only available in English.") return "Denna sida finns endast på engelska.";
  if(s=="DRAFTING STATUS") return "UTKASTSTATUS";
  if(s=="draft entry") return "utkast till begreppspost";
  if(s=="finished entry") return "färdig begreppspost";
  if(s=="DRAFT") return "UTKAST";
  if(s=="FINISHED") return "KLAR";
  if(s=="any drafting status") return "vilken utkaststatus som helst";
  if(s=="Prefabricated comments") return "Färdigförberedda kommentarer";
  if(s=="NOTES") return "ANMÄRKNINGAR";
  if(s=="note") return "anmärkning";
  if(s=="NOT") return "ANM";
  if(s=="with or without notes") return "med eller utan anmärkningar";
  if(s=="with a note") return "med en anmärkning";
  if(s=="with a note containing...") return "men en anmärkning som innehåller...";
  if(s=="without notes") return "utan anmärkningar";
  if(s=="any type") return "vilken typ som helst";
  if(s=="private note, not shown on extranets") return "internanmärkning som inte visas i extranät";
  if(s=="private note, shown on extranets") return "internanmärkning som visas i extranät";
  if(s=="public note") return "offentlig anmärkning";
  if(s=="Note types") return "Anmärkningstyper";
  if(s=="LEVEL") return "NIVÅ";
  if(s=="with a comment") return "med en kommentar";
  if(s=="with a comment containing...") return "med en kommentar som innehåller...";
  if(s=="TBX export") return "TBX-export";
  if(s=="TBX import") return "TBX-import";
  if(s=="Empty the termbase") return "Töm termbanken";
  if(s=="Careful now! You are about to delete this termbase. You will not be able to undo this.") return "Obs! Du håller på att radera denna termbank. Du kan inte ångra detta.";
  if(s=="Careful now! You are about to delete all entries and their history. You will not be able to undo this.") return "Obs! Du håller på att radera alla begreppsposter med tillhörande historik. Du kan inte ångra detta.";
  if(s=="RELATED TERMS") return "RELATERADE TERMER";
  if(s=="Your termbase at a glance") return "Kort om din termbank";
  if(s=="Number of entries") return "Antal begreppsposter";
  if(s=="Number of items in history log") return "Antal ändringar i historikloggen";
  if(s=="Your termbase is stored in the file %F") return "Din termbank lagras i filen %F";
  if(s=="File size") return "Filstorlek";
  if(s=="Download %F") return "Ladda ned %F";
  if(s=="Upload %F") return "Ladda upp %F";
  if(s=="Make sure that the file you are uploading is a valid Terminologue termbase. If you upload something else you will do irreparable damage to your termbase.") return "Kontrollera att filen du laddar upp är en giltig Terminologue-termbank. Om du laddar upp något annat kommer du att skada termbanken på ett oåterkalleligt sätt.";

  //new strings, machine-translated, in need of proofreading:
  if(s=="PARENT") return "FÖRÄLDER";
  if(s=="no parent") return "ingen förälder";
  if(s=="excluding subdomains") return "utan underdomäner";
  if(s=="including subdomains") return "underdomäner ingår";
  if(s=="the entry has this domain") return "begreppsposten har den här domänen";
  if(s=="the entry has only this domain") return "begreppsposten har bara den här domänen";
  if(s=="the entry has not only this domain") return "begreppsposten har inte bara den här domänen";
  if(s=="Careful! If you remove yourself from this termbase you will lose access to it.") return "Försiktig! Om du tar bort dig själv från den här termbasen förlorar du åtkomsten till den.";

  //New strings, need translation:
  if(s=="Leave this termbase") return s;

  if(!gloss) console.log(`if(s=="${s}") return "";`);
  else console.log(`if(s=="${s}", "${gloss}") return "";`);
  //if(s=="") return s;
  return s;
}

try {
  module.exports={
    L: L,
  }
} catch(e){}
