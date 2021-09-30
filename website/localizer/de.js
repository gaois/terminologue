function L(s, gloss){
  if(s=="only") return function(s){
    return "Nur "+s;
  };
  if(s=="READ-ONLY") return "Redaktion";
  if(s=="Editing") return "SCHREIBGESCHÜTZT";
  if(s=="Dublin City University") return "Dublin City University";
  if(s=="Log out") return "Logout";
  if(s=="Change your password") return "Passwort ändern";
  if(s=="Registered user login") return "Login für registrierte Benutzer";
  if(s=="Get an account") return "Konto einrichten";
  if(s=="Forgot your password?") return "Passwort vergessen?";
  if(s=="E-mail address") return "E-Mail-Adresse";
  if(s=="Password") return "Passwort";
  if(s=="Log in") return "Login";
  if(s=="Your termbases") return "Ihre Termbanken";
  if(s=="You have no termbases yet.") return "Sie haben noch keine Termbanken.";
  if(s=="Create a termbase") return "Termbank erstellen";
  if(s=="Administration") return "Administration";
  if(s=="Users") return "Benutzer";
  if(s=="Termbases") return "Termbanken";
  if(s=="smart search") return "Intelligente Suche";
  if(s=="complete term") return "Ganzes Wort";
  if(s=="start of term") return "Wortanfang";
  if(s=="end of term") return "Wortende";
  if(s=="any part of term") return "beliebiger Teil des Wortes";
  if(s=="any part except start or end") return "beliebiger Teil außer Anfang oder Ende";
  if(s=="search in all languages") return "Suche in allen Sprachen";
  if(s=="Configuration") return "Konfiguration";
  if(s=="ADMIN") return "ADMIN";
  if(s=="TRM") return "Begr.";
  if(s=="DOM") return "DOM";
  if(s=="DEF") return "DEF";
  if(s=="XMPL") return "BSP";
  if(s=="CHECKING STATUS") return "STATUS ÜBERPRÜFEN";
  if(s=="PUBLISHING STATUS") return "STATUS DER VERÖFFENTLICHUNG";
  if(s=="TERMS") return "BEGRIFFE";
  if(s=="DOMAINS") return "DOMAINS";
  if(s=="term") return "Begriff";
  if(s=="clarification") return "Klärung";
  if(s=="acceptability") return "Akzeptanz";
  if(s=="source") return "Quelle";
  if(s=="inflected form") return "flektierte Form";
  if(s=="annotation") return "Bemerkung";
  if(s=="domain") return "Domain";
  if(s=="part of speech") return "Wortart";
  if(s=="inflection") return "Flexion";
  if(s=="language of origin") return "Herkunftssprache";
  if(s=="symbol") return "Symbol";
  if(s=="trademark") return "Marke";
  if(s=="registered trademark") return "eingetragene Marke";
  if(s=="proper noun") return "Eigenname";
  if(s=="formatting") return "Formatierung";
  if(s=="italic") return "kursiv";
  if(s=="Created") return "Erstellt";
  if(s=="Changed") return "Geändert";
  if(s=="Deleted") return "Gelöscht";
  if(s=="Bulk-deleted") return "Bulk gelöscht";
  if(s=="while uploading") return "beim Hochladen";
  if(s=="By") return "Von";
  if(s=="When") return "Wann";
  if(s=="any checking status") return "beliebiger Prüfstatus";
  if(s=="any publishing status") return "beliebiger Veröffentlichungsstatus";
  if(s=="any language") return "beliebige Sprache";
  if(s=="any acceptabilty or no acceptability") return "beliebige Akzeptanz oder keine Akzeptanz";
  if(s=="any acceptabilty") return "beliebige Akzeptanz";
  if(s=="no acceptability") return "keine Akzeptanz";
  if(s=="any domain or no domain") return "beliebige Domain oder keine Domain";
  if(s=="any domain") return "beliebige Domain";
  if(s=="no domain") return "keine Domain";
  if(s=="LAST MAJOR UPDATE") return "LETZTES MAJOR UPDATE";
  if(s=="set to today") return "auf heute gesetzt";
  if(s=="Invalid e-mail address or password.") return "Ungültige E-Mail-Adresse oder ungültiges Passwort.";
  if(s=="INTR") return "INTR";
  if(s=="COLL") return "Slg.";
  if(s=="INTROS") return "INTROS";
  if(s=="DEFINITIONS") return "DEFINITIONEN";
  if(s=="EXAMPLES") return "BEISPIELE";
  if(s=="COLLECTIONS") return "SAMMLUNGEN";
  if(s=="definition") return "Definition";
  if(s=="example") return "Beispiel";
  if(s=="sentence") return "Satz";
  if(s=="collection") return "Sammlung";
  if(s=="any collection or no collection") return "beliebige Sammlung oder keine Sammlung";
  if(s=="any collection") return "beliebige Sammlung";
  if(s=="no collection") return "keine Sammlung";
  if(s=="comments") return "Kommentare";
  if(s=="with or without comments") return "mit oder ohne Kommentare";
  if(s=="with comments") return "mit Kommentaren";
  if(s=="without comments") return "ohne Kommentare";
  if(s=="my comments") return "meine Kommentare";
  if(s=="with or without my comments") return "mit oder ohne meine Kommentare";
  if(s=="with my comments") return "mit meinen Kommentaren";
  if(s=="without my comments") return "ohne meine Kommentare";
  if(s=="other people's comments") return "Kommentare von anderen Personen";
  if(s=="with or without other people's comments") return "mit oder ohne Kommentare von anderen Personen";
  if(s=="with other people's comments") return "mit den Kommentaren anderer Personen";
  if(s=="without other people's comments") return "ohne Kommentare anderer Personen";
  if(s=="EXTRANET") return "EXTRANET";
  if(s=="EXT") return "EXT";
  if(s=="EXTRANETS") return "EXTRANETS";
  if(s=="extranet") return "Extranet";
  if(s=="any extranet or no extranet") return "beliebiges Extranet oder kein Extranet";
  if(s=="any extranet") return "beliebiges Extranet";
  if(s=="no extranet") return "kein Extranet";
  if(s=="sorting language") return "Sortiersprache";
  if(s=="Create mutual cross-references") return "Gegenseitige Querverweise erstellen";
  if(s=="Remove mutual cross-references") return "Gegenseitige Querverweise entfernen";
  if(s=="Merge into a single entry") return "Zusammenführen zu einem einzigen Eintrag";
  if(s=="SEE ALSO") return "SIEHE AUCH";
  if(s=="add to worklist") return "Zur Arbeitsliste hinzufügen";
  if(s=="Domains") return "Domains";
  if(s=="Part-of-speech labels") return "POS-Tagging";
  if(s=="Inflection labels") return "Flexionsmarken";
  if(s=="Acceptability labels") return "Akzeptanzlabels";
  if(s=="Sources") return "Quellen";
  if(s=="Collections") return "Sammlungen";
  if(s=="Tags") return "Tags";
  if(s=="Extranets") return "Extranets";
  if(s=="Name and blurb") return "Name und Klappentext";
  if(s=="Features") return "Features";
  if(s=="Languages") return "Sprachen";
  if(s=="Publishing") return "Veröffentlichung";
  if(s=="Change the termbase's URL") return "URL der Termbank ändern";
  if(s=="Delete the termbase") return "Termbank löschen";
  if(s=="TITLE") return "TITEL";
  if(s=="abbreviation") return "Abkürzung";
  if(s=="LANGUAGES") return "SPRACHEN";
  if(s=="select all") return "Alles auswählen";
  if(s=="unselect all") return "Alles abwählen";
  if(s=="PRIORITY") return "PRIORITÄT";
  if(s=="high") return "hoch";
  if(s=="medium") return "mittel";
  if(s=="low") return "niedrig";
  if(s=="USERS") return "BENUTZER";
  if(s=="e-mail address") return "E-Mail-Adresse";
  if(s=="user") return "Benutzer";
  if(s=="Alphabetical order") return "Alphabetische Reihenfolge";
  if(s=="Similar terms (click to insert)") return "Ähnliche Begriffe (zum Einfügen klicken)";
  if(s=="Other entries that share this term") return "Andere Einträge, die diesen Begriff teilen";
  if(s=="stop sharing") return "Freigabe beenden";
  if(s=="Change checking status to") return "Prüfstatus ändern in";
  if(s=="Change publishing status to") return "Veröffentlichungsstatus ändern in";
  if(s=="Add to extranet") return "Zum Extranet hinzufügen";
  if(s=="Remove from extranet") return "Aus dem Extranet entfernen";
  if(s=="checked") return "geprüft";
  if(s=="not checked") return "nicht geprüft";
  if(s=="publishable") return "veröffentlichbar";
  if(s=="hidden") return "versteckt";
  if(s=="CHECKED") return "GEPRÜFT";
  if(s=="NOT CHECKED") return "NICHT GEPRÜFT";
  if(s=="PUBLISHABLE") return "VERÖFFENTLICHBAR";
  if(s=="HIDDEN") return "VERSTECKT";
  if(s=="non-essential") return "nicht-essentiell";
  if(s=="STATUS") return "STATUS";
  if(s=="live") return "Live";
  if(s=="not live") return "Nicht-Live";
  if(s=="any clarification or no clarification") return "beliebige Klärung oder keine Klärung";
  if(s=="any clarification") return "beliebige Klärung";
  if(s=="no clarification") return "keine Klärung";
  if(s=="clarification containing...") return "Klärung enthält...";
  if(s=="any intro or no intro") return "beliebiges Intro oder kein Intro";
  if(s=="any intro") return "beliebiges Intro";
  if(s=="no intro") return "kein Intro";
  if(s=="intro containing...") return "Intro enthält...";
  if(s=="any definition or no definition") return "beliebige Definition oder keine Definition";
  if(s=="any definition") return "beliebige Definition";
  if(s=="no definition") return "keine Definition";
  if(s=="definition containing...") return "Definition enthält...";
  if(s=="any example or no example") return "beliebiges Beispiel oder kein Beispiel";
  if(s=="any example") return "beliebiges Beispiel";
  if(s=="no example") return "kein Beispiel";
  if(s=="example containing...") return "Beispiel enthält...";
  if(s=="Automatic changes") return "Automatische Änderungen";
  if(s=="NAME") return "NAME";
  if(s=="BLURB") return "KLAPPENTEXT";
  if(s=="level") return "Level";
  if(s=="reader") return "Leser";
  if(s=="editor") return "Editor";
  if(s=="creator") return "Ersteller";
  if(s=="administrator") return "Administrator";
  if(s=="configurator") return "Konfigurator";
  if(s=="no change") return "keine Änderung";
  if(s=="change to 'not checked'") return "Änderung in 'nicht geprüft'";
  if(s=="change to 'hidden'") return "Änderung in 'versteckt'";
  if(s=="change to 'not checked' and 'hidden'") return "Änderung in 'nicht geprüft' und 'versteckt'";
  if(s=="LAST SEEN") return "ZULETZT ANGEMELDET";
  if(s=="NEVER") return "NIEMALS";
  if(s=="No termbases") return "Keine Termbanken";
  if(s=="language") return "Sprache";
  if(s=="major") return "wichtig";
  if(s=="minor") return "gering";
  if(s=="role") return "Rolle";
  if(s=="title") return "Titel";
  if(s=="ACCESS LEVEL") return "ZUGANGSEBENE";
  if(s=="LICENCE") return "LIZENZ";
  if(s=="private") return "privat";
  if(s=="public") return "öffentlich";
  if(s=="trigger_dateStampChange") return "Datumsstempel geändert";
  if(s=="trigger_domainAdd") return "Domain hinzugefügt";
  if(s=="trigger_domainRemove") return "Domain entfernt";
  if(s=="trigger_domainReorder") return "Domains neu sortiert";
  if(s=="trigger_domainChange") return "Domain geändert";
  if(s=="trigger_desigAdd") return "Begriff hinzugefügt";
  if(s=="trigger_desigRemove") return "Begriff entfernt";
  if(s=="trigger_desigReorder") return "Begriffe neu geordnet";
  if(s=="trigger_desigClarifChange") return "Klärung geändert";
  if(s=="trigger_desigAcceptChange") return "Akzeptanz geändert";
  if(s=="trigger_termLangChange") return "Begriffssprache geändert";
  if(s=="trigger_termWordingChange") return "Wortlaut des Begriffs geändert";
  if(s=="trigger_termInflectAdd") return "flektierte Form hinzugefügt";
  if(s=="trigger_termInflectRemove") return "flektierte Form entfernt";
  if(s=="trigger_termInflectReorder") return "flektierte Formen neu sortiert";
  if(s=="trigger_termInflectLabelChange") return "Beschriftung der flektierten Formen geändert";
  if(s=="trigger_termInflectTextChange") return "Wortlaut der flektierten Form geändert";
  if(s=="trigger_termAnnotAdd") return "Begriffsanmerkung hinzugefügt";
  if(s=="trigger_termAnnotRemove") return "Begriffsanmerkung entfernt";
  if(s=="trigger_termAnnotReorder") return "Begriffsanmerkungen neu geordnet";
  if(s=="trigger_termAnnotPositionChange") return "Position der Begriffsanmerkung geändert";
  if(s=="trigger_termAnnotLabelChange") return "Beschriftung der Begriffsanmerkung geändert";
  if(s=="trigger_introChange") return "Intro geändert";
  if(s=="trigger_definitionAdd") return "Definition hinzugefügt";
  if(s=="trigger_definitionRemove") return "Definition entfernt";
  if(s=="trigger_definitionReorder") return "Definitionen neu geordnet";
  if(s=="trigger_definitionTextChange") return "Definitionstext geändert";
  if(s=="trigger_exampleAdd") return "Beispiel hinzugefügt";
  if(s=="trigger_exampleRemove") return "Beispiel entfernt";
  if(s=="trigger_exampleReorder") return "Beispiele neu sortiert";
  if(s=="trigger_exampleTextAdd") return "Beispielsatz hinzugefügt";
  if(s=="trigger_exampleTextRemove") return "Beispielsatz entfernt";
  if(s=="trigger_exampleTextReorder") return "Beispielsätze neu geordnet";
  if(s=="trigger_exampleTextChange") return "Formulierung des Beispielsatzes geändert";
  if(s=="trigger_collectionAdd") return "Sammlung hinzugefügt";
  if(s=="trigger_collectionRemove") return "Sammlung entfernt";
  if(s=="trigger_collectionReorder") return "Sammlungen neu sortiert";
  if(s=="trigger_collectionChange") return "Sammlung geändert";
  if(s=="trigger_extranetAdd") return "Extranet hinzugefügt";
  if(s=="trigger_extranetRemove") return "Extranet entfernt";
  if(s=="trigger_extranetReorder") return "Extranets neu sortiert";
  if(s=="trigger_extranetChange") return "Extranet geändert";
  if(s=="trigger_sourceAdd") return "Quelle hinzugefügt";
  if(s=="trigger_sourceRemove") return "Quelle entfernt";
  if(s=="trigger_sourceReorder") return "Quelle neu geordnet";
  if(s=="trigger_sourceChange") return "Quelle geändert";
  if(s=="trigger_nonessentialChange") return "Nicht-Wesentlichkeit geändert";
  if(s=="(blank)") return "(leer)";
  if(s=="Simple Multilingual Termbase") return "Einfache mehrsprachige Termbank";
  if(s=="Simple Bilingual Termbase") return "Einfache zweisprachige Termbank";
  if(s=="Simple Monolingual Termbase") return "Einfache monolinguale Termbank";
  if(s=="Enter a human-readable title such as \"My Dictionary of Sports Terms\". You will be able to change this later.") return "Geben Sie einen lesbaren Titel ein, z. B. \"Mein Wörterbuch der Sportbegriffe\". Sie können diesen Titel später ändern.";
  if(s=="This will be your termbase's address on the web. You will be able to change this later.") return "Dies ist die Adresse Ihrer Termbank im Internet. Sie können diese Adresse später ändern.";
  if(s=="You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.") return "Hier können Sie eine Vorlage für den Anfang auswählen. Jede Vorlage enthält ein paar Beispieleinträge. Sie können diese ändern oder löschen und die Vorlage individuell anpassen.";
  if(s=="Your termbase is ready.") return "Ihre Termbank ist nun fertig.";
  if(s=="TERM OF THE DAY") return "BEGRIFF DES TAGES";
  if(s=="set to next available date") return "auf das nächste verfügbare Datum setzen";
  if(s=="Display from") return "Anzeige von";
  if(s=="Display until") return "Anzeige bis";
  if(s=="News and announcements") return "Nachrichten und Ankündigungen";
  if(s=="Create your account") return "Ihr Konto erstellen";
  if(s=="Reset your password") return "Ihr Passwort zurücksetzen";
  if(s=="Terminologue signup") return "Anmelden bei Terminologue";
  if(s=="Please follow the link below to create your Terminologue account:") return "Bitte folgen Sie dem unten stehenden Link, um Ihr Terminologue-Konto zu erstellen:";
  if(s=="Terminologue password reset") return "Terminologue-Passwort zurücksetzen";
  if(s=="Please follow the link below to reset your Terminologue password:") return "Bitte folgen Sie dem untenstehenden Link, um Ihr Terminologue-Passwort zurückzusetzen:";
  if(s=="This page is only available in English.") return "Diese Seite ist nur auf Englisch verfügbar.";
  if(s=="DRAFTING STATUS") return "ENTWURFSSTATUS";
  if(s=="draft entry") return "Entwurf eines Eintrags";
  if(s=="finished entry") return "fertiger Eintrag";
  if(s=="DRAFT") return "ENTWURF";
  if(s=="FINISHED") return "ABGESCHLOSSEN";
  if(s=="any drafting status") return "beliebiger Entwurfsstatus";
  if(s=="Prefabricated comments") return "Vorgefertigte Kommentare";
  if(s=="NOTES") return "NOTIZEN";
  if(s=="note") return "Notiz";
  if(s=="NOT") return "NOT";
  if(s=="with or without notes") return "mit oder ohne Notizen";
  if(s=="with a note") return "mit einer Notiz";
  if(s=="with a note containing...") return "mit einer Notiz bestehend aus...";
  if(s=="without notes") return "ohne Notizen";
  if(s=="any type") return "beliebiger Typ";
  if(s=="private note, not shown on extranets") return "private Notiz, die nicht in Extranets angezeigt wird";
  if(s=="private note, shown on extranets") return "private Notiz, die in Extranets angezeigt wird";
  if(s=="public note") return "öffentliche Notiz";
  if(s=="Note types") return "Notiz-Typen";
  if(s=="LEVEL") return "LEVEL";
  if(s=="with a comment") return "mit einem Kommentar";
  if(s=="with a comment containing...") return "mit einem Kommentar bestehend aus...";
  if(s=="TBX export") return "TBX-Export";
  if(s=="TBX import") return "TBX-Import";
  if(s=="Empty the termbase") return "Termbank leeren";
  if(s=="Careful now! You are about to delete this termbase. You will not be able to undo this.") return "Jetzt Vorsicht! Sie sind dabei, diese Termbank zu löschen. Sie können dies nicht mehr rückgängig machen.";
  if(s=="Careful now! You are about to delete all entries and their history. You will not be able to undo this.") return "Jetzt Vorsicht! Sie sind dabei, alle Einträge und deren Verlauf zu löschen. Sie können dies nicht mehr rückgängig machen.";
  if(s=="RELATED TERMS") return "VERWANDTE BEGRIFFE";
  if(s=="Your termbase at a glance") return "Ihre Termbank auf einen Blick";
  if(s=="Number of entries") return "Anzahl der Einträge";
  if(s=="Number of items in history log") return "Anzahl der Einträge im Verlaufsprotokoll";
  if(s=="Your termbase is stored in the file %F") return "Ihre Termbank ist in der Datei %F gespeichert";
  if(s=="File size") return "Dateigröße";
  if(s=="Download %F") return "Download %F";
  if(s=="Upload %F") return "Hochladen %F";
  if(s=="Make sure that the file you are uploading is a valid Terminologue termbase. If you upload something else you will do irreparable damage to your termbase.") return "Vergewissern Sie sich, dass die Datei, die Sie hochladen, eine gültige Terminologue-Datenbank ist. Wenn Sie etwas anderes hochladen, wird Ihre Termbank unwiderruflich beschädigt.";
  if(s=="PARENT") return "PARENT";
  if(s=="no parent") return "kein Parent";
  if(s=="excluding subdomains") return "ohne Subdomains";
  if(s=="including subdomains") return "einschließlich Subdomains";
  if(s=="the entry has this domain") return "der Eintrag hat diese Domain";
  if(s=="the entry has only this domain") return "der Eintrag hat nur diese Domain";
  if(s=="the entry has not only this domain") return "der Eintrag hat nicht nur diese Domain";
  if(s=="Careful! If you remove yourself from this termbase you will lose access to it.") return "Oprez! Ako se uklonite iz ove terminološke baze, nećete joj više moći pristupiti.";"Vorsicht! Wenn Sie sich aus dieser Datenbank entfernen, verlieren Sie den Zugang zu ihr.";

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
