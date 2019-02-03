var docSpec={
	onchange: function(jsSurrogate){
		//console.log(jsSurrogate.parent());
	},
	elements: {

		"newUser": {
			displayName: "en: newUser | ga: úsáideoirNua | cs: novýUživatel",
			collapsible: false,
			attributes: {
				"email": {
					displayName: "en: email | ga: ríomhphost | cs: email",
					asker: Xonomy.askString,
					askerParameter: {},
				},
				"password": {
					displayName: "en: password | ga: pasfhocal | cs: heslo",
					asker: Xonomy.askString,
					askerParameter: {},
				},
			},
		},
		"user": {
			displayName: "en: user | ga: úsáideoir | cs: uživatel",
			collapsible: false,
			attributes: {
				"lastSeen": {
					displayName: "en: lastSeen | ga: cuairtDheireanach | cs: naposledViděn",
					isReadOnly: true,
				},
				"password": {
					displayName: "en: password | ga: pasfhocal | cs: heslo",
					asker: Xonomy.askString,
					askerParameter: {},
					menu: [{
						caption: "en: Remove | ga: Bain | cs: Odstranit",
						action: Xonomy.deleteAttribute,
					}],
				},
			},
			menu: [{
				caption: "en: Add @password | ga: Cuir @pasfhocal leis | cs: Přidat @heslo",
				action: Xonomy.newAttribute,
				actionParameter: {name: "password", value: ""},
				hideIf: function(jsMe){ return jsMe.hasAttribute("password"); },
			}],
		},
		"dict": {
			displayName: "en: termbase | ga: cnuasach | cs: databáze",
			isReadOnly: true,
			oneliner: true,
			hasText: false,
			collapsible: false,
			attributes: {
				"id": {
					asker: Xonomy.askString,
				},
				"title": {
					displayName: "en: title | ga: teideal | cs: jméno",
				},
			},
		},
	},
	unknownElement: {
		isReadOnly: true,
		oneliner: true,
		hasText: false,
		collapsible: false,
		menu: [{caption: "en: Remove | ga: Bain | cs: Odstranit", action: Xonomy.deleteElement}],
	},
	unknownAttribute: {
		isReadOnly: true,
		menu: [{caption: "en: Remove | ga: Bain | cs: Odstranit", action: Xonomy.deleteAttribute}],
	},

};
