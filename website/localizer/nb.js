function L(s, gloss){
  if(s=="only") return function(s){
    return "Kun "+s;
  };
  if(s=="READ-ONLY") return "READ-ONLY";
  if(s=="Editing") return "Redigering";
  if(s=="Dublin City University") return "Dublin City University";
  if(s=="Log out") return "Logg ut";
  if(s=="Change your password") return "Endre ditt passord";
  if(s=="Registered user login") return "Innlogging for registrerte brukere";
  if(s=="Get an account") return "Opprett en brukerkonto";
  if(s=="Forgot your password?") return "Glemt passord?";
  if(s=="E-mail address") return "E-postadresse";
  if(s=="Password") return "Passord";
  if(s=="Log in") return "Logg inn";
  if(s=="Your termbases") return "Dine termbaser";
  if(s=="You have no termbases yet.") return "Du har ennå ingen termbaser.";
  if(s=="Create a termbase") return "Lag en termbase.";
  if(s=="Administration") return "Administrering";
  if(s=="Users") return "Brukere";
  if(s=="Termbases") return "Termbaser";
  if(s=="smart search") return "smart søk";
  if(s=="complete term") return "hele termen";
  if(s=="start of term") return "begynnelsen på termen";
  if(s=="end of term") return "slutten på termen";
  if(s=="any part of term") return "vilkårlig del av termen";
  if(s=="any part except start or end") return "vilkårlig del unntatt begynnelse eller slutt";
  if(s=="search in all languages") return "søke på alle språk";
  if(s=="Configuration") return "Konfigurering";
  if(s=="ADMIN") return "ADMIN";
  if(s=="TRM") return "TRM";
  if(s=="DOM") return "DOM";
  if(s=="DEF") return "DEF";
  if(s=="XMPL") return "XMPL";
  if(s=="CHECKING STATUS") return "SJEKKESTATUS";
  if(s=="PUBLISHING STATUS") return "PUBLISERINGSSTATUS";
  if(s=="TERMS") return "TERMER";
  if(s=="DOMAINS") return "DOMENER";
  if(s=="term") return "term";
  if(s=="clarification") return "forklaring";
  if(s=="acceptability") return "godkjenning";
  if(s=="source") return "kilde";
  if(s=="inflected form") return "bøyd form";
  if(s=="annotation") return "notat";
  if(s=="domain") return "domene";
  if(s=="part of speech") return "ordklasse";
  if(s=="inflection") return "bøyning";
  if(s=="language of origin") return "opphavsspråk";
  if(s=="symbol") return "symbol";
  if(s=="trademark") return "varemerke";
  if(s=="registered trademark") return "registrert varemerke";
  if(s=="proper noun") return "egennavn";
  if(s=="formatting") return "format";
  if(s=="italic") return "kursiv";
  if(s=="Created") return "Opprettet";
  if(s=="Changed") return "Endret";
  if(s=="Deleted") return "Fjernet";
  if(s=="Bulk-deleted") return "Fjernet i parti";
  if(s=="while uploading") return "under opplasting";
  if(s=="By") return "Av";
  if(s=="When") return "Når";
  if(s=="any checking status") return "hvilken som helst kontrollstatus";
  if(s=="any publishing status") return "hvilken som helst publiseringsstatus";
  if(s=="any language") return "hvilket som helst språk";
  if(s=="any acceptability or no acceptability") return "hvilken som helst eller ingen godkjenning";
  if(s=="any acceptability") return "hvilken som helst godkjenning";
  if(s=="no acceptability") return "ingen godkjenning";
  if(s=="any domain or no domain") return "hvilken som helst eller ingen domene";
  if(s=="any domain") return "hvilken som helst domene";
  if(s=="no domain") return "ingen domene";
  if(s=="LAST MAJOR UPDATE") return "SIST STOR OPPDATERING";
  if(s=="set to today") return "sett til i dag";
  if(s=="Invalid e-mail address or password.") return "Ugydlig e-postadresse eller passord.";
  if(s=="INTR") return "INTR";
  if(s=="COLL") return "COLL";
  if(s=="INTROS") return "INTROER";
  if(s=="DEFINITIONS") return "DEFINISJONER";
  if(s=="EXAMPLES") return "EKSEMPLER";
  if(s=="COLLECTIONS") return "SAMLINGER";
  if(s=="definition") return "definisjon";
  if(s=="example") return "eksempel";
  if(s=="sentence") return "setning";
  if(s=="collection") return "samling";
  if(s=="any collection or no collection") return "hvilken som helst eller ingen samling";
  if(s=="any collection") return "hvilken som helst samling";
  if(s=="no collection") return "ingen samling";
  if(s=="comments") return "kommentarer";
  if(s=="with or without comments") return "med eller uten kommentarer";
  if(s=="with comments") return "med kommentarer";
  if(s=="without comments") return "uten kommentarer";
  if(s=="my comments") return "mine kommentarer";
  if(s=="with or without my comments") return "med eller uten mine kommentarer";
  if(s=="with my comments") return "med mine kommentarer";
  if(s=="without my comments") return "uten mine kommentarer";
  if(s=="other people's comments") return "andres kommentarer";
  if(s=="with or without other people's comments") return "med eller uten andres kommentarer";
  if(s=="with other people's comments") return "med andres kommentarer";
  if(s=="without other people's comments") return "uten andres kommentarer";
  if(s=="EXTRANET") return "EKSTRANET";
  if(s=="EXT") return "EXT";
  if(s=="EXTRANETS") return "EKSTRANET";
  if(s=="extranet") return "ekstranet";
  if(s=="any extranet or no extranet") return "hvilken som helst eller ingen ekstranet";
  if(s=="any extranet") return "hvilken som helst ekstranet";
  if(s=="no extranet") return "ingen ekstranet";
  if(s=="sorting language") return "sorteringsspråk";
  if(s=="Create mutual cross-references") return "Opprett gjensidige kryssreferanser";
  if(s=="Remove mutual cross-references") return "Fjern gjensidige kryssreferanser";
  if(s=="Merge into a single entry") return "Slå sammen til én oppføring";
  if(s=="SEE ALSO") return "SE OGSÅ";
  if(s=="add to worklist") return "legg til på arbeidslisten";
  if(s=="Domains") return "Domener";
  if(s=="Part-of-speech labels") return "Ordklassemerkelapper";
  if(s=="Inflection labels") return "Merkelapp for bøyning";
  if(s=="Acceptability labels") return "Merkelapp for godkjenning";
  if(s=="Sources") return "Kilder";
  if(s=="Collections") return "Samlinger";
  if(s=="Tags") return "Emneknagger";
  if(s=="Extranets") return "Ekstranet";
  if(s=="Name and blurb") return "Navn og vaskeseddel";
  if(s=="Features") return "Funksjoner";
  if(s=="Languages") return "Språk";
  if(s=="Publishing") return "Publisering";
  if(s=="Change the termbase's URL") return "Bytt termbasens URL.-adresse";
  if(s=="Delete the termbase") return "Fjern termbasen";
  if(s=="TITLE") return "OVERSKRIFT";
  if(s=="abbreviation") return "forkortelse";
  if(s=="LANGUAGES") return "SPRÅK";
  if(s=="select all") return "velg alle";
  if(s=="unselect all") return "fjern alle markeringer";
  if(s=="PRIORITY") return "PRIORITET";
  if(s=="high") return "høy";
  if(s=="medium") return "middels";
  if(s=="low") return "lav";
  if(s=="USERS") return "BRUKERE";
  if(s=="e-mail address") return "e-postadresse";
  if(s=="user") return "bruker";
  if(s=="Alphabetical order") return "Alfabetisk rekkefølge";
  if(s=="Similar terms (click to insert)") return "Lignende termer (klikk for å legge til)";
  if(s=="Other entries that share this term") return "Andre oppføringer som deler denne termen";
  if(s=="stop sharing") return "stopp deling";
  if(s=="Change checking status to") return "Endre kontrollstatus til";
  if(s=="Change publishing status to") return "Endre publiseringsstatus til";
  if(s=="Add to extranet") return "Legg til i ekstranett";
  if(s=="Remove from extranet") return "Fjern fra ekstranett";
  if(s=="checked") return "kontrollert";
  if(s=="not checked") return "ikke kontrollert";
  if(s=="publishable") return "klar til å publiseres";
  if(s=="hidden") return "skjult";
  if(s=="CHECKED") return "KONTROLLERT";
  if(s=="NOT CHECKED") return "IKKE KONTROLLERT";
  if(s=="PUBLISHABLE") return "KLAR TIL Å PUBLISERES";
  if(s=="HIDDEN") return "SKJULT";
  if(s=="non-essential") return "uvesentlig";
  if(s=="STATUS") return "STATUS";
  if(s=="live") return "direkte";
  if(s=="not live") return "ikke direkte";
  if(s=="any clarification or no clarification") return "hvilken som helst eller ingen avklaring";
  if(s=="any clarification") return "hvilken som helst avklaring";
  if(s=="no clarification") return "ingen avklaring";
  if(s=="clarification containing...") return "avklaringen inneholder....";
  if(s=="any intro or no intro") return "hvilken som helst eller ingen intro";
  if(s=="any intro") return "hvilken som helst intro";
  if(s=="no intro") return "ingen intro";
  if(s=="intro containing...") return "introen inneholder....";
  if(s=="any definition or no definition") return "hvilken som helst eller ingen forklaring";
  if(s=="any definition") return "hvilken som helst forklaring";
  if(s=="no definition") return "ingen forklaring";
  if(s=="definition containing...") return "forklaringen inneholder...";
  if(s=="any example or no example") return "hvilket som helst eller inget eksempel";
  if(s=="any example") return "hvilket som helst eksempel";
  if(s=="no example") return "intet avklaring";
  if(s=="example containing...") return "avklaringen inneholder....";
  if(s=="Automatic changes") return "Automatiske endringer";
  if(s=="NAME") return "NAVN";
  if(s=="BLURB") return "VASKESEDDEL";
  if(s=="level") return "nivå";
  if(s=="reader") return "leser";
  if(s=="editor") return "redaktør";
  if(s=="creator") return "skaper";
  if(s=="administrator") return "administrator";
  if(s=="configurator") return "konfigurerer";
  if(s=="no change") return "ingen endring";
  if(s=="change to 'not checked'") return "bytt til «ikke kontrollert»";
  if(s=="change to 'hidden'") return "bytt til «skjult»";
  if(s=="change to 'not checked' and 'hidden'") return "bytt til «ikke kontrollert» og «skjult»";
  if(s=="LAST SEEN") return "SIST SETT";
  if(s=="NEVER") return "ALDRI";
  if(s=="No termbases") return "Ingen termbaser";
  if(s=="language") return "språk";
  if(s=="major") return "førsterangs";
  if(s=="minor") return "annenrangs";
  if(s=="role") return "rolle";
  if(s=="title") return "tittel";
  if(s=="ACCESS LEVEL") return "TILGANGSNIVÅ";
  if(s=="LICENCE") return "LISENS";
  if(s=="private") return "privat";
  if(s=="public") return "offentlig";
  if(s=="trigger_dateStampChange") return "datostempel ble endret";
  if(s=="trigger_domainAdd") return "domene ble lagt til";
  if(s=="trigger_domainRemove") return "domene ble fjernet";
  if(s=="trigger_domainReorder") return "domener ble ordnet på nytt";
  if(s=="trigger_domainChange") return "domene ble endret";
  if(s=="trigger_desigAdd") return "begrep ble lagt til";
  if(s=="trigger_desigRemove") return "begrep ble fjernet";
  if(s=="trigger_desigReorder") return "begreper ble ordnet på nytt";
  if(s=="trigger_desigClarifChange") return "oppklaring ble endret";
  if(s=="trigger_desigAcceptChange") return "akseptabilitet ble endret";
  if(s=="trigger_termLangChange") return "begrepsspråk ble endret";
  if(s=="trigger_termWordingChange") return "begrepstekst ble endret";
  if(s=="trigger_termInflectAdd") return "bøyd form ble lagt til";
  if(s=="trigger_termInflectRemove") return "bøyd form ble fjernet";
  if(s=="trigger_termInflectReorder") return "bøyde former ble ordnet på nytt";
  if(s=="trigger_termInflectLabelChange") return "merkelapp for bøyd form ble endret";
  if(s=="trigger_termInflectTextChange") return "ordlyd på bøyd form ble endret";
  if(s=="trigger_termAnnotAdd") return "begrepsnotat  ble lagt til";
  if(s=="trigger_termAnnotRemove") return "begrepsnotat  ble fjernet";
  if(s=="trigger_termAnnotReorder") return "begrepsnotater ble ordnet på nytt";
  if(s=="trigger_termAnnotPositionChange") return "sted for begrepsnotat ble endret";
  if(s=="trigger_termAnnotLabelChange") return "merkelapp på begrepsnotat ble endret";
  if(s=="trigger_introChange") return "intro ble endret";
  if(s=="trigger_definitionAdd") return "definisjon ble lagt til";
  if(s=="trigger_definitionRemove") return "definisjon ble fjernet";
  if(s=="trigger_definitionReorder") return "definisjoner ble ordnet på nytt";
  if(s=="trigger_definitionTextChange") return "definisjon text ble endret";
  if(s=="trigger_exampleAdd") return "eksempel ble lagt til";
  if(s=="trigger_exampleRemove") return "eksempel ble fjernet";
  if(s=="trigger_exampleReorder") return "eksempler ble ordnet på nytt";
  if(s=="trigger_exampleTextAdd") return "eksempelsetning ble lagt til";
  if(s=="trigger_exampleTextRemove") return "eksempelsetning ble fjernet";
  if(s=="trigger_exampleTextReorder") return "eksempelsetninger ble ordnet på nytt";
  if(s=="trigger_exampleTextChange") return "ordlyd på eksempelsetning ble endret";
  if(s=="trigger_collectionAdd") return "samling ble lagt til";
  if(s=="trigger_collectionRemove") return "samling ble fjernet";
  if(s=="trigger_collectionReorder") return "samlinger ble ordnet på nytt";
  if(s=="trigger_collectionChange") return "samling ble endret";
  if(s=="trigger_extranetAdd") return "ekstranett ble lagt til";
  if(s=="trigger_extranetRemove") return "ekstranett ble fjernet";
  if(s=="trigger_extranetReorder") return "alle ekstranett ble ordnet på nytt";
  if(s=="trigger_extranetChange") return "ekstranett ble endret";
  if(s=="trigger_sourceAdd") return "kilde ble lagt til";
  if(s=="trigger_sourceRemove") return "kilde ble fjernet";
  if(s=="trigger_sourceReorder") return "kilde ble ordnet på nytt";
  if(s=="trigger_sourceChange") return "kilde ble endret";
  if(s=="trigger_nonessentialChange") return "ikke-vesentlighet ble endret";
  if(s=="(blank)") return "(tom)";
  if(s=="Simple Multilingual Termbase") return "Enkel flerspråklig termbase";
  if(s=="Simple Bilingual Termbase") return "Enkel tospråklig database";
  if(s=="Simple Monolingual Termbase") return "Enkel enspråklig database";
  if(s=="Enter a human-readable title such as \"My Dictionary of Sports Terms\". You will be able to change this later.") return "Oppgi en menneskelig lesbar overskrift, for eksempel «Min ordbok over sportsuttrykk». Du kan endre denne senere.";
  if(s=="This will be your termbase's address on the web. You will be able to change this later.") return "Dette blir adressen til din termbase på nettet. Du kan endre denne senere.";
  if(s=="You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.") return "Her kan du velge en mal til å starte med. Hver mal har noen eksempeloppføringer. Du kan endre eller fjerne disse og tilpasse malen for dine behov.";
  if(s=="Your termbase is ready.") return "Tembasen din er klar.";
  if(s=="TERM OF THE DAY") return "DAGENS TERM";
  if(s=="set to next available date") return "sett til neste tilgjengelige dato";
  if(s=="Display from") return "Vis fra";
  if(s=="Display until") return "Vis til";
  if(s=="News and announcements") return "Nyheter og kunngjøringer";
  if(s=="Create your account") return "Opprett din konto";
  if(s=="Reset your password") return "Nullstill passordet ditt";
  if(s=="Terminologue signup") return "Registrering til Terminologue";
  if(s=="Please follow the link below to create your Terminologue account:") return "Følg lenken nedenfor for å opprette din Terminologue-konto:";
  if(s=="Terminologue password reset") return "Nullstilling av Terminologue-passordet";
  if(s=="Please follow the link below to reset your Terminologue password:") return "Følg lenken nedenfor for å nullstille ditt passord til Terminologue:";
  if(s=="This page is only available in English.") return "Denne siden fins bare på engelsk.";
  if(s=="DRAFTING STATUS") return "UTKASTSTATUS";
  if(s=="draft entry") return "oppføringsutkast";
  if(s=="finished entry") return "ferdig oppføring";
  if(s=="DRAFT") return "UTKAST";
  if(s=="FINISHED") return "FERDIG";
  if(s=="any drafting status") return "hvilken som helst utkaststatus";
  if(s=="Prefabricated comments") return "Forhåndsskrevne kommentarer";
  if(s=="NOTES") return "NOTATER";
  if(s=="note") return "notat";
  if(s=="NOT") return "NOT";
  if(s=="with or without notes") return "med eller uten notater";
  if(s=="with a note") return "med notat";
  if(s=="with a note containing...") return "med notat som inneholder...";
  if(s=="without notes") return "uten notater";
  if(s=="any type") return "hvilken som helst sort";
  if(s=="private note, not shown on extranets") return "privat notat, ikke synlig i ekstranett";
  if(s=="private note, shown on extranets") return "privat notat, vises i ekstranett";
  if(s=="public note") return "offentlig notat";
  if(s=="Note types") return "Notattyper";
  if(s=="LEVEL") return "NIVÅ";
  if(s=="with a comment") return "med kommentar";
  if(s=="with a comment containing...") return "med kommentar som inneholder...";
  if(s=="TBX export") return "TBX-eksport";
  if(s=="TBX import") return "TBX-import";
  if(s=="Empty the termbase") return "Tøm termbasen";
  if(s=="Careful now! You are about to delete this termbase. You will not be able to undo this.") return "Forsiktig! Du holder på med å fjerne denne termbasen. Du kan ikke angre dette senere.";
  if(s=="Careful now! You are about to delete all entries and their history. You will not be able to undo this.") return "Forsiktig! Du holder på med å fjerne alle termene og tilknyttede logger. Du kan ikke angre dette senere.";
  if(s=="RELATED TERMS") return "RELATERTE TERMER";
  if(s=="Your termbase at a glance") return "Oversikt over din termbase";
  if(s=="Number of entries") return "Antall oppføringer";
  if(s=="Number of items in history log") return "Antall poster i loggen";
  if(s=="Your termbase is stored in the file %F") return "Din termbase er lagret i filen %F";
  if(s=="File size") return "Filstørrelse";
  if(s=="Download %F") return "Last ned %F";
  if(s=="Upload %F") return "Last opp %F";
  if(s=="Make sure that the file you are uploading is a valid Terminologue termbase. If you upload something else you will do irreparable damage to your termbase.") return "Se til at filen som du skal laste opp en en gyldig Terminologue-termbase. Hvis du laster opp noe annet, fører det til uopprettelige skader på din termbase.";
  if(s=="PARENT") return "OVERORDNET";
  if(s=="no parent") return "ingen overordnet";
  if(s=="excluding subdomains") return "uten subdomener";
  if(s=="including subdomains") return "med subdomener";
  if(s=="the entry has this domain") return "oppføringen hører til dette domenet";
  if(s=="the entry has only this domain") return "oppføringen hører kun til dette domenet";
  if(s=="the entry has not only this domain") return "oppføringen hører kun til dette domenet";
  if(s=="Careful! If you remove yourself from this termbase you will lose access to it.") return "Pass på! Hvis du fjerner deg selv fra denne termbasen, mister du tilgangen til den.";

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
