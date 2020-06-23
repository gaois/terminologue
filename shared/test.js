var toTBX=require("./entry-to-tbx.js");
var entry={
  id: 960129,
  "cStatus": "1",
  "pStatus": "1",
  "dStatus": "1",
  "dateStamp": "",
  "tod": "",
  "domains": [
    "5346876"
  ],
  "desigs": [
    {
      "term": {
        "id": "915692",
        "lang": "en",
        "wording": "matter",
        "annots": [
          {
            "start": "1",
            "stop": "6",
            "label": {
              "type": "posLabel",
              "value": "913528"
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
        "id": "923463",
        "lang": "ga",
        "wording": "ábhar",
        "annots": [
          {
            "start": "1",
            "stop": "5",
            "label": {
              "type": "posLabel",
              "value": "913550"
            }
          }
        ],
        "inflects": [
          {
            "label": "913474",
            "text": "ábhair"
          },
          {
            "label": "913483",
            "text": "ábhair"
          },
          {
            "label": "913484",
            "text": "ábhar"
          }
        ]
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
    }
  ],
  "intros": {
    "ga": "",
    "en": ""
  },
  "definitions": [],
  "examples": [
    {
      "texts": {
        "ga": [
          "Féadfaidh aon pháirtí nó aon duine leasmhar eile, sula mbeidh na himeachtaí os comhair an Scrúdaitheora curtha i gcrích, tuairim na Cúirte a lorg ar aon ábhar a thiocfaidh chun cinn i gcúrsa na n-imeachtaí, ar fhógra a bheith tugtha do gach duine cuí."
        ],
        "en": [
          "Any party or other person interested may, before the proceedings before the Examiner are concluded, take the opinion of the Court upon any matter arising in the course of the proceedings upon notice given to all proper persons."
        ]
      },
      "sources": [],
      "nonessential": "0"
    }
  ],
  "notes": [
    {
      "type": "913502",
      "texts": {
        "ga": "OneLook Bouvier's Law Dictionary: Some substantial or essential thing, opposed to form; facts",
        "en": ""
      },
      "sources": [],
      "nonessential": "0"
    },
    {
      "type": "913502",
      "texts": {
        "ga": "OED: An event, circumstance, fact, question, state or course of things, etc., which is or may be an object of consideration or practical concern; a subject, an affair, a business.",
        "en": ""
      },
      "sources": [],
      "nonessential": "0"
    },
    {
      "type": "913502",
      "texts": {
        "ga": "oxforddictionaries.com: Law, something which is to be tried or proved in court; a case",
        "en": ""
      },
      "sources": [],
      "nonessential": "0"
    },
    {
      "type": "913493",
      "texts": {
        "ga": "Fonn orm é seo a mharcáil 'seiceáilte - ábhar ginearálta'. Tá brí an fhocail 'matter' ag brath ar an bhfocal cáilíochta a chuirtear leis: an academic matter, a legal matter, a matter of life or death...",
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
  "xrefs": []
};
var ret=toTBX(entry);
console.log(ret);
