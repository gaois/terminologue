# Configuring Terminologue

Much of the behaviour of your Terminologue installation can be configured by editing the file `siteconfig.json`. This document explains what all the settings mean. You need to restart the application every time you make changes for them to take effect.

---

```json
"readonly": false
```
You can use this setting to switch your installation into read-only mode, for example while you're doing server maintenance. Any publicly accessible parts of the website will still be available, but users will not be able to log in, and those who are logged in already will not be able to save anything. A small "read-only" caption will be shown beside the Terminologue logo in each page to communicate this to users.

---

```json
"baseUrl": "http://localhost/",
"rootPath": "/",
"port": 80
```

`baseUrl` is the URL at which your installation is accessible to the public. In production you will want to change this into a real, publicly visible URLs such as `https://myterminologueinstallation.mycompany.com/`.

The path part of the URL, such as `/`, needs to be included as part of `baseUrl` **and** given separately as `rootPath`. For example, if your installation is available to the public under the URL `http://www.mycompany.com/terminologue/`, then you should have:

```json
"baseUrl": "http://www.mycompany.com/terminologue/",
"rootPath": "/terminologue/"
```

If your URL contains anything other than the default HTTP port then, again, the port should be included in `bsaeUrl` **and** given separately as `port`.

---

```json
"dataDir": "../data/"
```

This is the path to the `data` directory (where Terminologue keeps all its databases), relative to the `website` directory.

---

```json
"admins": ["root@localhost"]
```

These are the login names of "superusers": users who have special privileges in this Terminologue installation. The special privileges are: you have full, writable access to everything in every termbase, and you see a link on the home to a section of Terminologue where you can administer all user accounts.

---

```json
"trackingCode": ""
```

If you want to use a service like Google Analytics or StatCounter to collect statistics about website traffic, you can put the HTML code here and Terminologue will insert into at the end (before `</body>`) of every publicly visible HTML page.

---

```json
"uilangs": [
  {"abbr": "en", "caption": "English"},
  {"abbr": "ga", "caption": "Gaeilge"},
  {"abbr": "cs", "caption": "česky"},
  {"abbr": "sv", "caption": "svenska"}
],
"uilangDefault": "en"
```

These are the UI languages that appear in the language switcher widget at the top right corner of every screen, and the default languages used for new users. You can use these settings to change the default language, to change the order of languages in the switcher widget, or to disable some languages.

For every UI languages listed here the following things need to exist:

- A file containing localized strings for the Screenful library, such as `website/libs/screenful/screenful-loc-en.js`.
- A file containing Terminologue-specific localized strings, such as `website/localizer/en.js`.

So, if you want to add a new language, these are the things you need to supply. If you are localizing Terminologue into a new language, please consider sharing it with the world by submitting it to Terminologue's repository (as as pull request).

---

```json
"welcome": {
  "en": "<div class='intro'>Welcome to <strong>Terminologue</strong>...",
  "ga": "<div class='intro'>Fáilte go <strong>Terminologue</strong>...",
  "cs": "<div class='intro'>Vítá vás <strong>Terminologue</strong>...",
  "sv": "<div class='intro'>Välkommen till <strong>Terminologue</strong>..."
}
```

This is the welcome message that appears on the home page. There has to be one for every UI language.

---

```json
"mailconfig": {"host": "localhost", "port": 465, "secure": false, "from": "noreply@localhost"}
```

When users sign up for accounts in Terminologue, ask to retrieve forgotten passwords and so on, Terminologue sends confirmation emails using this SMTP server.

If these settings are missing or invalid, nothing terrible will happen, Terminologue will operate as normal (except that no e-mails will be sent).

---

```json
"licences": {
  "cc-by-4.0": {
    "title": "Creative Commons Attribution 4.0 International",
    "url": "https://creativecommons.org/licenses/by/4.0/",
    "icon": "furniture/lic-cc-by.png"
  },
  "cc-by-sa-4.0": {
    "title": "Creative Commons Attribution Share-Alike 4.0 International",
    "url": "https://creativecommons.org/licenses/by-sa/4.0/",
    "icon": "furniture/lic-cc-by-sa.png"
  },
  "odbl-1.0": {
    "title": "Open Database Licence 1.0",
    "url": "https://opendatacommons.org/licenses/odbl/summary/",
    "icon": "furniture/lic-opendata.png"
  }
}
```

These are the licences under which users can make a termbase available to the public. When a user makes a termbase publicly visible, they will have to choose one of these.

---

```json
"defaultAbc": [
  ["a", "á", "à", "â", "ä", "ă", "ā", "ã", "å", "ą", "æ"],
  ["b"],
  ["c", "ć", "ċ", "ĉ", "č", "ç"],

  ...

  ["x"],
  ["y", "ý", "ỳ", "ŷ", "ÿ"],
  ["z", "ź", "ż", "ž"]
]
```

The default alphabetical order. Terminologue will use this if a user has not specified a different listing order for a language in their termbase.

---

```json
"propagatorMsSqlConnectionStrings": {
  "mytermbase": "Server=localhost\\SQLEXPRESS;Database=mydatabase;User Id=myname;Password=mypassword"
}
```

This is a feature which lets you configure specific termbases such that all changes users make to them are immediately propagated into another database in Microsoft SQL Server. The key (such as `"mytermbase"`) is the name if the termbase in Terminologue and the value is a connection string for the Microsoft SQL Server database.
