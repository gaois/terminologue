var docSpec={
	onchange: function(jsSurrogate){
		//console.log(jsSurrogate.parent());
	},
	elements: {

		"newUser": {
			//displayName: "en: newUser | ga: úsáideoirNua | cs: novýUživatel | sv: nyAnvändare",
			collapsible: false,
			attributes: {
				"email": {
					//displayName: "en: email | ga: ríomhphost | cs: email | sv: e-post",
					asker: Xonomy.askString,
					askerParameter: {},
				},
				"password": {
					//displayName: "en: password | ga: pasfhocal | cs: heslo | sv: lösenord",
					asker: Xonomy.askString,
					askerParameter: {},
				},
			},
		},
		"user": {
			//displayName: "en: user | ga: úsáideoir | cs: uživatel | sv: användare",
			collapsible: false,
			attributes: {
				"lastSeen": {
					//displayName: "en: lastSeen | ga: cuairtDheireanach | cs: naposledViděn | sv: senastVisad",
					isReadOnly: true,
				},
				"password": {
					//displayName: "en: password | ga: pasfhocal | cs: heslo | sv: lösenord",
					asker: Xonomy.askString,
					askerParameter: {},
					menu: [{
						caption: "en: Remove | ga: Bain | cs: Odstranit | sv: Ta bort",
						action: Xonomy.deleteAttribute,
					}],
				},
			},
			menu: [{
				//caption: "en: Add @password | ga: Cuir @pasfhocal leis | cs: Přidat @heslo | sv: Lägg till @lösenord",
				caption: "Add @password",
				action: Xonomy.newAttribute,
				actionParameter: {name: "password", value: ""},
				hideIf: function(jsMe){ return jsMe.hasAttribute("password"); },
			}],
		},
		"dict": {
			// displayName: "en: termbase | ga: cnuasach | cs: databáze | sv: termbank",
			displayName: "termbase",
			isReadOnly: true,
			oneliner: true,
			hasText: false,
			collapsible: false,
			attributes: {
				"id": {
					asker: Xonomy.askString,
				},
				"title": {
					// displayName: "en: title | ga: teideal | cs: jméno | sv: titel",
				},
			},
		},
	},
	unknownElement: {
		isReadOnly: true,
		oneliner: true,
		hasText: false,
		collapsible: false,
		// menu: [{caption: "en: Remove | ga: Bain | cs: Odstranit | sv: Ta bort", action: Xonomy.deleteElement}],
		menu: [{caption: "Remove", action: Xonomy.deleteElement}],
	},
	unknownAttribute: {
		isReadOnly: true,
		// menu: [{caption: "en: Remove | ga: Bain | cs: Odstranit | sv: Ta bort", action: Xonomy.deleteAttribute}],
		menu: [{caption: "Remove", action: Xonomy.deleteAttribute}],
	},

};
