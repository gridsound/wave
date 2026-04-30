"use strict";

GSUloadJSFile( "assets/gsuiWaveletList-v1.js?1" ).then( init );

function init() {
	$body.$append(
		$.$div( { id: "main" },
			$.$div( { id: "head" },
				$.$div( { id: "title" },
					$.$div( { id: "logo" } ),
					$.$span( null, "by GridSound" ),
					$.$button( { icon: "info" } ),
				),
				$.$elem( "gsui-com-button", { text: "WAV file" } ),
			),
			$.$div( { id: "content" },
				$.$div( { id: "myWave" },
					$.$elem( "gsui-wave-editor" ),
				),
				$.$div( { id: "myPiano" },
					$.$elem( "gsui-keys", { orient: "horizontal", octaves: "3 1" } ),
				),
			),
		),
	);

	const ctx = GSUaudioContext();
	GSUaudioCurrentContext = ctx;

	const waSyn = new gswaSynth();
	const keys = {};
	const oscId = "0";
	const oscWtName = GSUformatWavetableName( "0", oscId );
	const oscObjChange = {
		envs: {
			gain: {
				release: .05,
			},
		},
		oscillators: {
			[ oscId ]: GSUgetModel( "oscillator", {
				wave: oscWtName,
				wavetable: GSUgetModel( "wavetable" ),
			} ),
		},
	};

	const uiKeys = $( "gsui-keys" );
	const uiWave = $( "gsui-wave-editor" );
	let currentWaveArray = null;

	waSyn.$setContext( ctx );
	waSyn.$output.connect( ctx.destination );
	waSyn.$change( oscObjChange );

	gswaCrossfade.$loadModule( ctx );
	gswaPeriodicWaves.$addWavetable( oscWtName, oscObjChange.oscillators[ 0 ].wavetable.waves );

	$( "#head gsui-com-button" ).$onclick( () => {
		const pcm = gswaEncodeWAV.$encodeManual( {
			$nbChannels: 1,
			$sampleRate: 44100,
			$chan0: currentWaveArray,
		} );

		GSUdownloadBlob( "gridsound-wave.wav", gswaEncodeWAV.$createBlob( pcm ) );
	} );

	$( "#title button" ).$onclick( () => {
		$popup.$custom( {
			ok: "Ok",
			title: "About",
			element: $.$div( { style: "max-width:340px" },
				$.$elem( "i", null, "wave.gridsound.com" ),
				$.$span( null, " is a wavelet editor. It's also a subpart of the GridSound's synthesizer." ),
				$.$elem( "br" ),
				$.$elem( "br" ),
				$.$span( null, "All the waveforms you can select on the top-left corner button come from " ),
				$.$linkExt( { href: "https://www.adventurekid.se/akrt/waveforms/" }, "Kristoffer Ekstrand (aka Adventure Kid)" ),
				$.$span( null, " special thanks to him ❤️" ),
				$.$elem( "br" ),
				$.$elem( "br" ),
				$.$span( null, "You are invited to create an account on " ),
				$.$link( { href: "gridsound.com/#/auth" }, "GridSound" ),
				$.$span( null, " and start creating and publish your own musics " ),
				$.$icon( { icon: "music" } ),
				$.$elem( "br" ),
				$.$elem( "br" ),
				$.$elem( "br" ),
				$.$div( { style: "text-align:center; font-size:12px; font-weight:bold" },
					`© ${ new Date().getFullYear() } `,
					$.$link( { href: "//gridsound.com" }, "gridsound.com" ),
					" all rights reserved",
				),
			),
		} );
	} );

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

		currentWaveArray = waveArray;
		waSyn.$change( {
			oscillators: {
				[ oscId ]: {
					wavetable: { waves },
				},
			},
		} );
		gswaPeriodicWaves.$updateWavetable( oscWtName, waves, waves );
	}

	uiWave.$get( 0 ).$reset( "sawtooth" );
	changeWave( GSUmathWaveSawtooth( 2048 ) );
	$body
		.$setAttr( "data-skin", "gray" )
		.$observeSize( ( w, h ) => {
			const b = w > h;

			uiKeys.$setAttr( "orient", b ? "vertical" : "horizontal" );
			$body.$setAttr( "data-landscape", b );
		} )
		.$listen( {
			[ GSEV_KEYS_KEYDOWN ]: d => startKey( d.$args[ 0 ] ),
			[ GSEV_KEYS_KEYUP ]: d => stopKey( d.$args[ 0 ] ),
			[ GSEV_WAVEEDITOR_CHANGE ]: d => changeWave( d.$args[ 0 ] ),
		} );
}
