# Gentle introduction to Terminologue

This page is a brief walk-through of Terminologue’s most important features. To start using Terminologue, go to the [home page](/) and open an account. Once you have an account you can log in using your e-mail address and password. When you are logged in, the home page has a section titled *Your termbases*. The section is empty at first but there is a link to create a new termbase.

![Your personal Terminologue homepage after you have logged in.](/docs/intro01.png)

You can create as many termbases as you want and you can always delete them later. When creating a new termbase, Terminologue will ask you what URL you would like for the termbase. Each termbase in Terminologue has its own URL, such as `www.terminologue.org/mytermbase`. If and when you decide to make your termbase publicly available, it will be available at that URL.

![Creating a new termbase in Terminologue.](/docs/intro02.png)

If you are new to Terminologue, it is recommended that you select a template in the drop-down list, for example *Basic multilingual termbase*. Your termbase will come preconfigured with certain settings (which you can change any time later) as well as a few sample entries (which you can delete).

Once your termbase has been created you can go to its homepage and from there to the editing interface. This is where you create and edit terminological entries. There is a list of entries on the left-hand side. You can delete the sample entries if you want, and you can create as many new entries as you want. There is no upper limit on the number of entries your termbase can contain. To edit an entry, click on it and it will appear on the space on the right hand-side.

![Terminologue’s editing interface, showing the list of entries on the left and one entry open on the right.](/docs/intro03.png)

What you see here is a formatted rendering of the entry. This is what the entry will look like if and when you decide to make your termbase public. To edit the entry, click the Edit button at the top. Terminologue opens the entry for editing.

![An entry open for editing.](/docs/intro04.png)

Each entry in Terminologue represents a concept, and each concept consists of elements such as terms, definitions, domain labels and so on. The tabs at the top allow you to edit these: you can edit the entry’s terms under the TRM tab, its definitions under the DEF tab and so on. For example, to add a new term to the entry, click the plus sign under the TRM tab and fill in the wording of the term. Once the term has been added you can add more information to it, for example a part-of-speech label, a transfer comment, or one or more inflected forms. Once you have finished editing the entry, do not forget to click the *Save* button at the top (or use the *Ctrl + Shift + S* keyboard shortcut).

Editing an entry basically means typing text into boxes and selecting values from lists. Many of the lists of values, such as part-of-speech labels, domain labels and so on, constitute the termbase’s metadata and can be configured individually for each termbase in the *Administration* section. If you started your termbase from a template, then you will already have some metadata preconfigured here.

![The Administration section where you can configure various lists for your termbase, such as part-of-speech labels (shown here).](/docs/intro05.png)

Other properties of your termbase can be configured in the *Configuration* section. One important thing you have control over is who has access to the termbase and who can make changes there, besides yourself. This can be found under *Users*. You will see your own e-mail address listed there. This means that you have access to this termbase. You can add other users here and configure their access privileges (for example: some users can edit entries and other cannot, some users can only edit entries but cannot delete or create them, some users cannot edit metadata, and so on). Any user on this list will have access to your termbase – provided they have a Terminologue account. The next time they log in, they will see the termbase listed under *Your termbases* on the Terminologue homepage.

![Configuring who can access your termbase.](/docs/intro06.png)

Terminologue is not just a tool for editing termbases, it is a tool for making termbases publicly available on the web, too. To make a termbase publicly viewable, go into *Publising* in the *Configuration* section and change the setting from *private* to *Public*. You can also change the termbase back to *private* any time. You can even decide which entries are publicly visible and which not: any entry can be labelled as *hidden* in the editing interface and it will then not be visible publicly, even if the termbase as a whole is public.

![Making a termbase publicly viewable.](/docs/intro07.png)

From the moment you make your termbase public, its homepage (for example `www.terminologue.org/mytermbase`) will display a textbox where people can search your termbase, as well other features for browsing the termbase alphabetically or by domain. The public presentation of your termbase is optimized to be easily discoverable by search engines such as Google and Bing. All publicly viewable pages have responsive design and render well on screens of all sizes, from large desktop computers to small mobile devices.

![The homepage of a publicly viewable termbase.](/docs/intro08.png)

Now that we have seen how to use Terminologue to create, edit and eventually publish a termbase, let us zoom in on some of the more interesting features of Terminologue.

## Searching and finding

As we have seen, the editing screen is divided into two halves: a list of entries on the left-hand side and a space for viewing and editing an entry in the right-hand side. The search box at the top of the entry list allows you to search the termbase.

A drop-down list underneath the search box allows you select the search mode. The options are *complete term*, *start of term*, *end of term* and a few others. These modes perform simple character-by-character matching. But the default option in the drop-down list is *smart search* which performs a linguistically intelligent search. The list of entries you obtain from *smart search* is ordered in such a way that entries which match your search text more or less completely and exactly are at the top, followed by multi-word entries which contain the search text as a word. This matching is inflection-aware. Terminologue has access to a large database of inflected forms of words in many different languages, so for example, a search for ‘walk’ will find terms containing ‘walking’, ‘walked’, ‘walks’ and so on. Another feature of *smart search* is that it performs spelling correction and offers spelling suggestions on the right-hand side the text box.

![Smart search in action.](/docs/intro09.png)

Searching is not the only way to navigate around a termbase. Terminologue also offers faceted filtering when you can filter the entry list by various criteria such as domains, editorial status and others.

![Filtering entries by domain in Terminologue’s faceted filtering feature.](/docs/intro10.png)

## Inline grammatical annotations

It will surprise no-one that, in Terminologue, you can attach part-of speech label and other grammatical labels to terms. But what's really special about Terminologue is that it lets you attach grammatical labels to individual words in multi-word terms. When attaching a grammatical label to a term, you can optionally tell Terminologue which substring of the term it applies to. Then, when Terminologue is displaying the term in the formatted rendering of the entry, it will insert the label into the term at the correct location. The user can mouse-over the label and Terminologue will highlight the substring it applies to.

![Highlighting tells the user which part of the multi-word term the label applies to.](/docs/intro12.png)

## Term sharing

Another innovative and unusual feature of Terminologue is that a term can be shared among multiple entries. When a term is shared, Terminologue communicates that fact to the user with an icon beside the term. You can click the icon to see which other entries share this term. But most importantly, the icon is there to warn you that if you make any changes to the term here, the same changes will automatically propagate the other entries too.

![This entry contains two terms, one of which is shared with one other entry.](/docs/intro13.png)

Term sharing is intended to save human editors work and to enforce consistency. So, when adding a new term to an entry, Terminologue will tell you if such a term already exists elsewhere and will give you the option to link that term instead of creating a duplicate. Term sharing is useful if terms in your termbase are richly annotated with grammatical labels and inflected forms.

## Entry status

Every entry in Terminologue has a status label which is either ‘checked’ or ‘not checked’. When a user creates a new entry it is ‘not checked’ at first, and only users with administrator privileges can change them to ‘checked’. Also, when a user makes certain edits to an existing entry, for example changes the spelling of a term or adds a definition, the status will automatically change to ‘not checked’. It is possible to configure individually for each termbase which kinds of edits trigger this change (under *Configuration → Automatic changes*).

Users with administrator privileges can use Terminologue’s faceted search feature to obtain a list of unchecked entries and review them periodically. The purpose of this feature is to help with quality control on large termbases where large teams cooperate.

## User privileges

Every user in every termbase is assigned one of five access levels which determine what actions the user is or is not allowed to do in the termbase.
Levels can be assigned to user under *Configuration → Users*. The levels are:

1. ‘Reader’:  the user has read-only access,  can look at entries but cannot make any edits.
2. ‘Editor’: the user can change existing entries, but cannot create or delete entries.
3. ‘Creator’: same as Editor, but can create and delete entries.
4. ‘Administrator’: same as Creator, and can edit metadata (domain lists etc.), can change the status of entries, and can create extranets (see below).
5. ‘Configurator’: same as Administrator, and can make changes to the termbase’s configuration, which includes potentially destructive operations such as deleting the termbase.

## History log

Terminologue keeps a log of every change to every entry and it is possible to see the history of each entry in the editing interface. The log shows who saved each version and when, and what the changes made were. From the log it is possible to revert changes by bringing previous versions back to life by clicking the *Revive* link which appears when you hover the mouse on it. It is also possible to undo the deletion of an entry.

![The history of an entry is displayed in Terminologue as a timeline.](/docs/intro14.png)

## Tags and notes

Entries in Terminologue can be annotated with arbitrary *tags* and *notes*. These are for internal purposes and will never be visible publicly. The difference between *tags* and *notes* is that there is a fixed list of *tags* which a user can choose from in a drop-down list (these can be configured in the termbase’s *Administration* section) while *notes* can be any text. *Notes* and *tags* can be paired, so the *tag* can give the *note* a type (saying what kind of note it is).

![An entry with a few tags and notes.](/docs/intro11.png)

## Extranets

An extranet is a special section on the Terminologue website where a subset of a termbase has been made available for commenting to a closed group of external users. An example can be seen in Figure 15. Users of a termbase with Administrator privileges can create new extranets, decide which entries go on which extranet, and decide which users have access to which extranet. Extranet users are completely separate from other users of the termbase: they must have an account in Terminologue but, apart from that, they do not (need to) have access to the termbase itself. Comments left by extranet users are visible in the editing interface (as *notes*) and their purpose is to inform the termbase editor’s decisions.

![An extranet in Terminologue.](/docs/intro15.png)

## Downloading and uploading

Last but not least, Terminologue makes it possible for users (who have the appropriate privileges) to download and upload the termbase, either in its entirety or a subset. Data can be downloaded and uploaded either in Terminologue’s internal JSON format, or in TBX format. The JSON format is intended for transferring data from one Terminologue termbase to another, while the TBX format is for importing from and exporting into third-party software such as other terminology management tools, CAT tools or term extraction tools.

It is not advisable to use the TBX format for transferring data from one Terminologue termbase to into another because the conversion from Terminologue’s internal format to TBX is not lossless: some details are lost in the conversion. For example, TBX does not support inline grammatical annotations, so these are converted to TBX as if they were attached to the whole term.

## Conclusion

This brings us to the end of this introduction. Terminologue has a number of other features which we did not cover here and you will surely discover them as you use Terminologue. But most importantly, keep building great termbases!
