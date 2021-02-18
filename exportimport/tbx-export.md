# Export from Terminologue to TBX

This document explains the structure of TBX files exported from Terminologue. When exporting a termbase from Terminologue to TBX, the TBX file you get complies with TBX version 2, as defined in the standard [ISO 30042:2008](https://www.gala-global.org/sites/default/files/migrated-pages/docs/tbx_oscar_0.pdf). There is also a newer version, TBX version 3 ([ISO 30042:2019](https://www.tbxinfo.net/)), but TBX files exported from Terminologue do not comply with that.

The fact that the exported files are TBX (and which version) may be the only thing you need to know. However:

- TBX is an expressive schema which allows many things. The TBX files exported from Terminologue only make use of a subset of the full expressivity of TBX. It may be useful for you to know what that subset is.

- Terminologue and TBX are not isomorphic. Terminological entries in Terminologue have a structure which does not map one-to-one onto the structure of TBX entries. It may be useful for you to know how the various data types in Terminologue are mapped onto TBX elements, and where exporting might result in partial loss of information.

## The TBX file

```xml
<?xml version="1.0" encoding="UTF-8"?>
<martif type="TBX" xml:lang="ga">
  <martifHeader>
    <fileDesc>
  	<titleStmt>
  	  <title>My Termbase</title>
  	</titleStmt>
  	<sourceDesc>
  	  <p>This is a sample termbase created in Terminologue and exported into TBX.</p>
  	</sourceDesc>
    </fileDesc>
  </martifHeader>
  <text>
    <body>
  	  <termEntry>...</termEntry>
  	  <termEntry>...</termEntry>
  	  <termEntry>...</termEntry>
    </body>
  </text>
</martif>
```

The value of the `martif@xml:lang` attribute is the abbreviation of the first language listed in your termbase configuration in Terminologue *(Configuration > Languages)*. For the purposes of TBX export, this language is the **termbase language**. Most metadata elements further down the TBX file are in this language.

The title (in the `title` element) is taken from the *name* in the Termbase configuration *(Configuration > Name and blurb)*. Termbase titles in Terminologue can be multilingual: there can be multiple titles, one in each language. The title exported into TBX is the one in the **termbase language**.

The description (in `sourceDesc/p`) is taken from the *blurb* in the termbase configuration and is in the **termbase language**. It may be blank in the TBX file if there is no *blurb*.

## Entries

```xml
<termEntry id="eid-948718">
    <descrip type="subjectField">Law</descrip>
    <langSet xml:lang="en">
        <ntig>
            <termGrp>
                <term>award</term>
                <termNote type="partOfSpeech">s</termNote>
            </termGrp>
        </ntig>
        <descrip type="example">An award may, with the leave of the Court...</descrip>
    </langSet>
    <langSet xml:lang="ga">
        <ntig>
            <termGrp>
                <term>dámhachtain</term>
                <termNote type="partOfSpeech">bain3</termNote>
            </termGrp>
        </ntig>
        <descrip type="definition">cinneadh críochnaitheach eadránaí</descrip>
        <descrip type="example">Féadfar, le cead ón gCúirt, agus ar cibé téarmaí is cóir...</descrip>
    </langSet>
</termEntry>
```

Each entry is enclosed in `termEntry`. Its `@id` consists of the string `eid-` followed by the numerical ID of this entry in Terminologue.

There is a `langSet` element for each language for which the entry has at least one term, definition, example sentence or intro. The `@xml:lang` attribute is the abbreviation of that language in the termbase configuration.

Inside each `langSet` element you will always find one or more terms, encoded as `ntig` elements. Note that the TBX standard allows terms to be encoded either as (simple) `tig` or as (complex) `ntig`. In the TBX exported from Terminologue, terms are always encoded as `ntig` and the actual wording of the term is always found in `ntig/termGrp/term`.

In Terminologue it is possible for a term to be shared by more than one entry. There is no equivalent for term sharing in TBX. So, when a term is shared by two, three or more entries in Terminologue, it will be exported into TBX two, three or more times, inside each of its entries.

All other data, such as domain labels, definitions, example sentences and grammatical annotations, are exported into TBX either as `descrip` elements or as `termNode` elements, and appear in the TBX entry either at the entry level (as children of `termEntry`), at the language level (as children of `langSet`) or at term level (as children of `termGrp`).

The TBX standard allows for many other XML element names in addition to those mentioned here, but Terminologue never exports them.

## Terms

```xml
<ntig>
    <termGrp>
        <term>compulsory purchase order</term>
        <termNote type="partOfSpeech">s</termNote>
    </termGrp>
</ntig>
```

The `ntig` element always contains exactly one child, the `termGrp` element. The `termGrp` always contains exactly one `term` element, and may contain zero, one or more `termNote` elements. The `term` element contains the wording of the term. The language of the term can be found in the `@xml:lang` attribute of the `ntig`'s parent `langSet` element.

### Term annotations

In Terminologue, a *term annotation* is a label (typically: a part-of-speech label) which is attached either to an entire term or to a substring of the term. Term annotations are always exported as `<termNote>` elements and are always children of `<termGrp>` (and therefore siblings of `<term>`).

- Term annotations which are part-of-speech labels or inflection labels are exported as `<termNote type="partOfSpeech">...</termNote>`. The text inside the tags is the label's abbreviation.

- Term annotations which are language-of-origin labels are exported as `<termNote type="etymology">...</termNote>`. The text inside the tags is the language label's abbreviation.

- Term annotations which are trademark labels (™) or registered trademark labels (®) are exported as `<termNote type="proprietaryRestriction">trademark</termNote>`.

- Term annotations which are proper-noun labels (¶) are exported as `<termNote type="partOfSpeech">properNoun</termNote>`.

- Term annotation which put the term (or a substring of the term) in italics are **not** exported into TBX.

In the TBX exported from Terminologue, it is impossible to find out whether a `<termNote>` (and the *term annotation* it originated from) applies to the entire term or to a substring of the term: this information is **not** exported. Theoretically, it would be possible to encode this information in TBX using TBX's notion of term components (`<termComp>`). However, we have decided not to implement this in the TBX files exported from Terminologue because we suspect that this (i.e. attaching labels to substrings of terms as opposed to entire terms) is a rarely used option.

### Inflected forms

In Terminologue it is possible for a term to have a list of inflected forms of itself. There is no equivalent for this in TBX, so inflected forms are **not** exported into TBX. One could probably find a way to encode inflected forms in TBX somehow, for examples as `<termNote>`, but we have decided not to do this.

### Clarifications

In Terminologue, a term can be accompanied by a clarification, which is a short piece of text which clarifies which meaning of the term or which sense of the term is being evoked in that particular entry. This is exported as `<termNote type="transferComment">...</termNote>`. The text inside the tags is the clarification. This `<termNote>` element is a child of the `<termGrp>` element.

### Acceptability labels

In Terminologue, a term inside an entry can be accompanied by an acceptability label, which is typically a label like *deprecated*, *obsolete* or *preferred*. This is exported as `<termNote type="normativeAuthorization">...</termNote>`. The text inside the tags is the acceptability label in the language of the `<langSet>`. This `<termNote>` element is a child of the `<termGrp>` element.

## Definitions

Definitions are exported as `<descrip type="definition">...</descrip>`. The text between the tags is, of course, the text of the definition. This `<descrip>` element is a child of `<langSet>` such that, for each language, all definitions in that language are children of the `<langSet>` for that language.

In Terminologue, it is possible possible for an entry to have more than one definition. Therefore, in the TBX exported from Terminologue, it is possible for a `<langSet>` to have more than one `<descrip type="definition">`.

In Terminologue, inside a single entry, it is possible for definitions in different languages to grouped up if they are translations of each other (or one another). This grouping is **lost** in the export to TBX.

In Terminologue it is possible for definitions to have domain labels. These are **not** exported to TBX.

## Intros

In additions to definitions, entries in Terminologue can have something called *intros*. These are short informal mini-definitions of the concept. An entry can have up to one of these in each language.

Intros are exported as `<descrip type="explanation">...</descrip>`. The text between the tags is the text of the intro. This `<descript>` element is a child `<langSet>` such that the text of the intro is in the language of the `<langSet>`.

## Examples

Examples (example sentences) are exported as `<descrip type="example">...</descrip>`. The text between the tags is, of course, the text of the example. This `<descrip>` element is a child of `<langSet>` such that, for each language, all examples in that language are children of the `<langSet>` for that language.

In Terminologue, inside a single entry, it is possible for examples in different languages to grouped up if they are translations of each other (or one another). This grouping is **lost** in the export to TBX.

In Terminologue, it is possible for examples in the same language to be grouped up if they are variants of one another. This grouping is **lost** in the export to TBX.

## Domain labels

Domain labels are exported as `<descrip type="subjectField">...</descrip>`. The text between the tags is the domain label in the **termbase language**. This `<descrip>` element is a child of `<termEntry>` (and so it is **not** inside any `<langSet>`).

Domain labels in Terminologue can be hierarchical: a domain label can be a child of another domain label, which in turn can be the child of another domain label, and so on. When exporting domain labels to TBX, the entire hierarchy is given inside the `<desctipt>` element, with levels separated by the `»` character, for example `<descrip type="subjectField">Public safety » Policing » Police violence</descrip>`.

## Everything else

Any Terminologue data elements not mentioned above are **not** exported to TBX. This affects various administrative data (e.g. checking status, publishing status), any source labels attached to terms, definitions etc., notes attached to entries, comments attached to entries, membership of entries in collections, and the labelling of certain entry components as non-essential.
