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
	GSUcreateDiv( { id: "myPiano" },
		GSUcreateElement( "gsui-keys", { orient: "horizontal", octaves: "1 2" } ),
	),
	GSUcreateDiv( { id: "foot" },
		GSUcreateSpan( { id: "copyright" },
			`© ${ ( new Date() ).getFullYear() } `,
			GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
			" all rights reserved",
		),
	),
);

const ctx = GSUaudioContext();
const waSyn = new gswaSynth();
const keys = {};
const oscId = "0";
const oscWtName = GSUformatWavetableName( "0", oscId );
const oscObjChange = {
	oscillators: {
		[ oscId ]: GSUgetModel( "oscillator", {
			wave: oscWtName,
			wavetable: GSUgetModel( "wavetable" ),
		} ),
	},
};

const root = GSUdomQS( "#myWave" );
const uiWave = GSUdomQS( "gsui-wave-editor" );

waSyn.$setContext( ctx );
waSyn.$output.connect( ctx.destination );
waSyn.$change( oscObjChange );

gswaCrossfade.$loadModule( ctx );
gswaPeriodicWaves.$addWavetable( oscWtName, oscObjChange.oscillators[ 0 ].wavetable.waves );

lg( ctx.state );

function startKey( k ) {
	const kobj = {
		prev: null,
		next: null,
		key: k,
		when: 0,
		duration: 1,
		gain: .8,
		gainLFOAmp: 1,
		gainLFOSpeed: 1,
		pan: 0,
		highpass: 1,
		lowpass: 1,
		wtposCurves: {},
		selected: false,
	};

	keys[ k ] = waSyn.$startKey( [ [ "k1", kobj ] ], ctx.currentTime, 0, Infinity );
}
function stopKey( k ) {
	waSyn.$stopKey( keys[ k ] );
}

function changeWave( waveArray ) {
	const waves = {
		0: {
			curve: waveArray,
		},
	};

	waSyn.$change( {
		oscillators: {
			[ oscId ]: {
				wavetable: { waves },
			},
		},
	} );
	gswaPeriodicWaves.$updateWavetable( oscWtName, waves, waves )[ 0 ];
}

GSUdomSetAttr( GSUdomBody, "data-skin", "gray" );
uiWave.$reset( "sine" );
changeWave( GSUmathWaveSine( 2048 ) );

GSUdomListen( GSUdomBody, {
	[ GSEV_KEYS_KEYDOWN ]: d => startKey( d.$args[ 0 ] ),
	[ GSEV_KEYS_KEYUP ]: d => stopKey( d.$args[ 0 ] ),
	[ GSEV_WAVEEDITOR_CHANGE ]: d => changeWave( d.$args[ 0 ] ),
} );
