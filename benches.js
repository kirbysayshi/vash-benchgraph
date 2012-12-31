var  Benchmark = require('benchmark')
	,fs = require('fs')
	,path = require('path')
	,wrench = require('wrench')
	,clc = require('cli-color')
	,semver = require('semver')
	,diff = require('diff')

	,program = require('commander')

	,BenchmarkCliChart = require('./benchmark-cli-chart')
	,utils = require('./utils')


var loadTemplates = function( next ){

	var  includes = program.tinclude
		,excludes = program.texclude

	fs.readdir( path.join( __dirname, 'templates' ), function( err, files ){
		if( err ){ next(err); return; }

		(function read( err, data ){
			if( files.length ){
				var name = files.shift()

				if( excludes.length && excludes.indexOf(name) === -1 ){
					read( err, data );
					return;
				}

				if( includes.length && includes.indexOf(name) === -1 ){
					read( err, data );
					return;
				}

				fs.readFile( path.join( __dirname, 'templates', name ), 'utf8', function( err, str ){
					if( err ) { program.verbose && console.error( err, 'continuing...'); return; }

					var  parts = str.split('---')
						,tplObj = { filename: name, str: parts[1] }

					// not using JSON here because functions should be definable in model
					eval( 'var config = ' + parts[0] )

					// cheap copy
					for( var i in config ){
						tplObj[i] = config[i];
					}

					data.push( tplObj );
					read( err, data );
				})
			} else {
				next( null, data );
			}
		}( null, [] ))
	})
}

var requireVashes = function( next ){
	var vashes = {};

	fs.readdir( path.join( __dirname, 'vashes' ), function( err, files ){
		if( err ){ next(err); return; }

		var local;

		if( program.localversion ){
			local = require( path.join( __dirname, program.localversion ) );
			files.push( local.version );
			vashes[ local.version ] = local;
			vashes.local = local; // for ease of accessing later, everything else should ignore this key
		}

		if( program.versions ){
			console.log('Versions available:');
			files.sort(semver.compare).forEach(function(f){
				console.log( program.localversion && local && local.version === f
					? f + ' (' + program.localversion + ')'
					: f );
			})
			process.exit();
		}

		files.forEach(function(name){
			try{
				vashes[name] = require( path.join( __dirname, './', 'vashes', name) )
			} catch(e){
				program.verbose && console.error('Could not require vash@' + name + ', continuing...');
			}
		})

		next( err, vashes );
	})
}

var compileWithVersions = function( tpls, vashes, next ){
	var options = { debug: false, useWith: false, modelName: 'model' }

	var excludes = [ '0.5.2-1238' ]
		,includes = program.vinclude

	excludes = excludes.concat( program.vexclude )

	// avoid 0.5.11 coming before 0.5.2
	Object.keys( vashes ).sort( semver.compare ).forEach(function(i){

		tpls.forEach(function(tpl){

			tpl.compiled = tpl.compiled || {};

			var  isExcluded = excludes.some(semver.satisfies.bind(semver, i))
				,isIncluded = includes.some(semver.satisfies.bind(semver, i))

			isIncluded = program.vinclude.length > 0
				? isIncluded
				: true;

			// override if a local version was included and this is it
			if( vashes.local && vashes.local.version === i ){
				isIncluded = true;
				isExcluded = false;
			}

			try {
				if( isExcluded ){
					// just do nothing
					//process.stderr.write( 'Told to globally skip compiling tpls for vash@' + i + '...\n' );

				} else if( isIncluded ){

					program.verbose && process.stderr.write( 'Compiling ' + tpl.filename + ' with vash@' + i + '...\n' );

					// handle api change
					if( semver.gt( vashes[i].version, '0.2.1' ) ){
						tpl.compiled[ i ] = vashes[i].compile( tpl.str, tpl.config || options );
					} else {
						// only for <= 0.2.1
						tpl.compiled[ i ] = vashes[i].tpl( tpl.str, tpl.config || options );
					}

					if( program.dump ){
						console.log( clc.xterm(178)(tpl.name), clc.xterm(104)('vash@' + vashes[i].version) )
						console.log( tpl.compiled[ i ].toString() )
					}
				}

			} catch(e){
				program.verbose && process.stderr.write('Compile error with vash@' + i + ', continuing...\n');
				program.verbose && process.stderr.write( e.message + '\n' );
			}
		})
	})

	next( null, tpls );
}

var diffAll = function( tpls ){

	tpls.forEach(function( tpl ){

		var base;
		Object.keys(tpl.compiled).forEach(function(v, i){

			if( i === 0 ){
				base = utils.diff.bind(null, tpl.compiled[v]( tpl.model ), v)
				return;
			}

			var output = base( tpl.compiled[v]( tpl.model ), v ).split('\n')
			console.log( output.shift() );
			console.log( utils.linenos( output.join('\n') ) );
		})
	})
}

var diffCompiled = function( tpls ){

	tpls.forEach(function( tpl ){

		var base;
		Object.keys(tpl.compiled).forEach(function(v, i){

			if( i === 0 ){
				base = utils.diff.bind(null, tpl.compiled[v].toString(), v)
				return;
			}

			var output = base( tpl.compiled[v].toString(), v ).split('\n')
			console.log( output.shift() );
			console.log( utils.linenos( output.join('\n') ) );
		})
	});
}

var mkBench = function( tpls, next ){

	tpls.forEach(function( tpl ){

		var suite = new Benchmark.Suite({
			 name: tpl.filename + ( tpl.name ? ' ' + tpl.name : '' )
		});


		Object.keys(tpl.compiled).forEach(function(v){
			suite.add( v, {
				fn: function(){
					tpl.compiled[v]( tpl.model );
				}
			})
		})

		if( program.chart ){
			var chart = new BenchmarkCliChart( suite, { fields: program.chart } )
		} else {

			suite.on('cycle', function( ev ){
				var obj = {
					 suite: suite.name
					,vashv: ev.target.name
					,hz: ~~ev.target.hz // ops / sec
					,stats: ev.target.stats
				};

				console.log( JSON.stringify( obj ) )
			})

			suite.on('complete', function(){
				console.log('Fastest is ' + this.filter('fastest').pluck('name'));
			})
		}

		suite.run();

	})

	next( null );
}

function splitVersions(versions){
	return versions.split(',');
}

program

	// input options
	.option('-ve, --vexclude <versions>', 'Comma-delimited semver versions of vash to exclude from the benchmarks', splitVersions, [])
	.option('-vi, --vinclude <versions>', 'Comma-delimited semver versions of vash to include in the benchmarks', splitVersions, [])
	.option('-te, --texclude <filenames>', 'Comma-delimited template filenames to exclude', splitVersions, [])
	.option('-ti, --tinclude <filenames>', 'Comma-delimited template filenames to include', splitVersions, [])
	.option('-l, --localversion <vash path>', 'Provide a `require` path to a local copy of vash to include in benchmarks', '')

	// query options
	.option('-vs, --versions', 'Output valid vash versions and exit', false)

	// output options
	.option('-c, --chart [columns]', 'Output a chart instead of JSON, with optional comma-delimited column names: vashv,bar,ops,rme,percent,om,xfast', splitVersions, false)
	.option('-d, --dump', 'Output the decompiled templates without benchmarking', false)
	.option('-dc, --diffcompiled', 'Diff the decompiled templates without benchmarking', false)
	.option('-vf, --verify', 'Diff the rendered template output instead of benchmarking, using newest version as base', false)

	.option('-v, --verbose', 'More output', false)

// TODO: add --compile option, to bench compile times
// TODO: enable setting path to a local copy of vash for dev comparison
// TOOD: try forking each benchmark for multicore, for sake of duration

program.parse(process.argv);

//console.log(program);

loadTemplates(function( err, tpls ){

	requireVashes(function( err, vashes ){
		compileWithVersions( tpls, vashes, function( err, tpls ){
			//console.log( tpls );

			if( program.dump ){
				process.exit();
			}

			if( program.verify ){
				diffAll( tpls, function(){} );
				process.exit();
			}

			if( program.diffcompiled ){
				diffCompiled( tpls, function(){} );
				process.exit();
			}

			mkBench( tpls, function( err, suite ){
				//console.log('done?')
			})
		})
	})
})

