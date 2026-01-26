"use strict";

GSUdomBody.append(
	GSUcreateDiv( { id: "head" },
		GSUcreateDiv( { id: "title" },
			GSUcreateDiv( { id: "logo" } ),
			GSUcreateSpan( null, "by GridSound" ),
		),
	),
	GSUcreateDiv( { id: "myWave" },
		GSUcreateDiv( { id: "niceBorder" },
			GSUcreateElement( "gsui-wave-editor" ),
		),
	),
	GSUcreateDiv( { id: "foot" },
		GSUcreateSpan( { id: "copyright" },
			`© ${ ( new Date() ).getFullYear() } `,
			GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
			" all rights reserved",
		),
	),
);

GSUdomSetAttr( document.body, "data-skin", "gray" );

const root = GSUdomQS( "#myWave" );
const uiWave = GSUdomQS( "gsui-wave-editor" );
