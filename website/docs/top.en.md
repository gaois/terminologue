# Terminologue Offline Processor

![Screenshot](/docs/top.png)

*Terminologue Offline Processor* is a desktop application for exporting and importing data from and into a Terminologue termbase. *Terminologue Offline Processor* lets you convert terminological data between Terminologue's internal data format and external formats such as [TBX (TermBase Exchange)](https://en.wikipedia.org/wiki/TermBase_eXchange). See below for instructions on how to use *Terminologue Offline Processor*.

## Why is it a desktop application?

Unlike Terminologue itself, which is an online application you access through your web browser without having to install anything, *Terminologue Offline Processor* is a desktop application which you need to download and install on your own computer.

Why? This is because import and export are "heavy" operations: if your termbase is very large, moving all of its contents around can take a lot of time to run and use up a lot of the computer's memory and processor time. Because of that, import and export are not suitable to run on a web server. For this reason, we have packaged the import and export features into a separate desktop application: *Terminologue Offline Processor*.

## Download and installation

*Terminologue Offline Processor* is under development. The version of *Terminologue Offline Processor* which is available here is not fully functional yet and has some limitations. See the release notes below for detailed information on what *Terminologue Offline Processor* can do already and cannot do yet.

### Available now

- [Windows (64-bit)](/docs/top-win64.zip) — see release notes below.

### In preparation

- Windows (32-bit)
- GNU/Linux
- MacOS

## Using Terminologue Offline Processor

First of all, download and install *Terminologue Offline Processor* on your computer. Then, every time you need to import or export data into or from your termbase, you should follow this sequence of steps.

1. Download your termbase from the Terminologue website by going into the *Configuration* page of your termbase and clicking the download link you see there. This will download a file such as `mytermbase.sqlite` onto your computer.

2. Use *Terminologue Offline Processor* to export data from this file or import data into this file.

3. Finally, if you have imported any data into the file, you can upload it back to the Terminologue website by going to the *Configuration* page and clicking the upload link there.

Note: the download and upload links may not always be available on your termbase, depending on how the termbase is configured and depending on your access rights.

When you are **exporting** data from a termbase into another format (such as TBX), the target file is **ovewritten**, replacing any entries that may heve been there before. If the target file does not exist it is created anew.

When you are **importing** data from another format (such as TBX) into a termbase, the entries are **added** to the termbase. Any entries already in the termbase are not affected.

In each case, *Terminologue Offline Processor* always exports and imports **all** available entries.

If you are **re-importing** entries into the same termbase from which you have exported them, then again, the entries are **added** to those already there, meaning that you will end up with duplicate entries in your termbase. *Terminologue Offline Processor* makes no effort to detect or resolve duplicates during import.

## Release notes

This is an early version of *Terminologue Offline Processor* which does not have all intended functionality yet.

### Limitations related to installation

- *Terminologue Offline Processor* does not come with a user-friendly installer yet. To run it on a Windows 64-bit computer, [download the ZIP file](/docs/top-win64.zip) and unzip it into a folder anywhere on your computer. Enter the folder and launch the file `top.exe`.

- Packages and installers for other operating systems are in prepartion.

### Limitations related to export and import

- *Terminologue Offline Processor* can only export and import into and from TBX (TermBase Exchange) files. Other file formats, notably various spreadsheet formats, are in preparation.

- Currently, TBX export and import only works on **terms** (more accurately, the terms' wording). Other data types such as part-of-speech labels, domain labels or definitions are ignored. The goal, however, is to include all data types eventually.
