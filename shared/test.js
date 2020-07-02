var toTBX=require("./entry-to-tbx.js");
var fromTBX=require("./tbx-to-entry.js");

var entry={
  "cStatus": "1",
  "pStatus": "1",
  "dStatus": "1",
  "dateStamp": "",
  "tod": "",
  "domains": [
    "5346886",
    "5346887",
    "5346896"
  ],
  "desigs": [
    {
      "term": {
        "id": "919030",
        "lang": "en",
        "wording": "administrator",
        "annots": [
          {
            "start": "1",
            "stop": "13",
            "label": {
              "type": "posLabel",
              "value": "913528"
            }
          },
          {
            "start": "1",
            "stop": "13",
            "label": {
              "type": "symbol",
              "value": "tm"
            }
          }

        ],
        "inflects": []
      },
      "accept": null,
      "clarif": "",
      "sources": [
        "913808",
        "913809",
        "913811",
        "913810",
        "5340706"
      ],
      "nonessential": "0"
    },
    {
      "term": {
        "id": "920091",
        "lang": "ga",
        "wording": "riarthóir",
        "annots": [
          {
            "start": "1",
            "stop": "9",
            "label": {
              "type": "posLabel",
              "value": "913572"
            }
          }
        ],
        "inflects": [
          {
            "label": "913474",
            "text": "riarthóra"
          },
          {
            "label": "913485",
            "text": "riarthóirí"
          }
        ]
      },
      "accept": "4141129",
      "clarif": "",
      "sources": [
        "913808",
        "913809",
        "913811",
        "913810",
        "5340706"
      ],
      "nonessential": "0"
    },
    {
      "term": {
        "id": "5349754",
        "lang": "en",
        "wording": "administratix",
        "annots": [
          {
            "start": "1",
            "stop": "0",
            "label": {
              "type": "posLabel",
              "value": "913528"
            }
          }
        ],
        "inflects": []
      },
      "accept": null,
      "clarif": "ag tagairt do riarthóir mná",
      "sources": [
        "5340706"
      ],
      "nonessential": "0"
    }
  ],
  "intros": {
    "ga": "",
    "en": ""
  },
  "definitions": [
    {
      "texts": {
        "ga": "duine a bhfuil údarás dlí aige nó aici chun bainistíocht a dhéanamh ar mhaoin duine eile",
        "en": ""
      },
      "sources": [],
      "domains": [],
      "nonessential": "0"
    }
  ],
  "examples": [
    {
      "texts": {
        "ga": [
          "Más creidiúnaí an príomhaí, cuir isteach anseo: ‘‘go rátúil agus go comhréireach agus de réir na tosaíochta a cheanglaítear le dlí, gan tosaíocht a thabhairt, áfach, dá fhiach/fiach féin de bharr é/í a bheith ina riarthóir ná d’fhiach aon duine eile’’."
        ],
        "en": [
          "Where the principal is a creditor, insert here: \"rateably and proportionately and according to the priority required by law, not, however, preferring his/her own debt by reason of his/her being administrator/administratix nor the debt of any other person\"."
        ]
      },
      "sources": [],
      "nonessential": "0"
    },
    {
      "texts": {
        "ga": [
          "In aon chúis nó ábhar chun eastát duine éagtha a riaradh ní bheidh páirtí ar bith seachas an seiceadóir nó an riarthóir i dteideal, gan cead chuige sin a fháil ón gCúirt, láithriú ag aon chéim ar an éileamh ó aon duine nach páirtí sa chúis nó san ábhar i gcoinne eastát an duine éagtha i leith aon fhéich nó dliteanais."
        ],
        "en": [
          "In any cause or matter for the administration of the estate of a deceased person no party other than the executor or administrator shall, unless by leave of the Court, be entitled to appear at any stage on the claim of any person not a party to the cause or matter against the estate of the deceased person in respect of any debt or liability."
        ]
      },
      "sources": [],
      "nonessential": "0"
    }
  ],
  "notes": [
    {
      "type": "913493",
      "texts": {
        "ga": "Féach \"administratrix\". In Merriam-Webster: administratrix = a woman who is an administrator especially of an estate.",
        "en": ""
      },
      "sources": [],
      "nonessential": "0"
    },
    {
      "type": "913502",
      "texts": {
        "ga": "Murdoch's; administrator / administratrix.\nA person (male/female) appointed to manage the property of another. (1) The person to whom the grant of administration of the estate of a deceased person is made. An administrator of an estate has the same rights and liabilities as if he were the executor of the deceased: Succession Act 1965 s.27. He is required to enter into a bond called an administration bond: RSC O.79 rr.29-32; RSC App Q Part 11. An attorney, acting under a power of attorney, or a guardian, may be an administrator: RSC O.79 rr.23 and 25.",
        "en": ""
      },
      "sources": [],
      "nonessential": "0"
    },
    {
      "type": "4141127",
      "texts": {
        "ga": "Agus an téarma seo á phlé, socraíodh gur chóir iontráil eile 'administratrix' a chruthú. Déanta agus crostagairt cruthaithe.",
        "en": ""
      },
      "sources": [],
      "nonessential": "0"
    }
  ],
  "collections": [
    "5346855"
  ],
  "extranets": [
    "5346860"
  ],
  "xrefs": [
    "961765",
    "963229",
    "5348139",
    "5348645"
  ]
};
var ret=toTBX(entry);
console.log(ret);

// var tbx=`<termEntry id="eid-960129">
//   <langSet xml:lang="ga">
//     <ntig><termGrp><term id="tid-923463">ábhar</term></termGrp></ntig>
//   </langSet>
//   <langSet xml:lang="en">
//     <ntig><termGrp><term id="tid-915692">matter</term></termGrp></ntig>
//   </langSet>
// </termEntry>`;
var tbx=ret;
var ret=fromTBX(tbx);
console.log(JSON.stringify(ret, null, "  "));
