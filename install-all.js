
var  child_process = require('child_process')
	,fs = require('fs')
	,wrench = require('wrench')
	,path = require('path')

var getVersions = function( next ){
	var versionsargs = [ 'info', 'vash', 'versions', '--json' ]
	child_process.execFile( 'npm', versionsargs, null, function(err, stdout, stderr){
		if( !err ) next( err, JSON.parse( stdout ));
		else next( err, stdout, stdin );
	})
}

var installVersion = function(version, next){
	var args = [ 'install', 'vash@' + version ]
	child_process.spawn( 'npm', args, { stdio: 'inherit' }).on('exit', function(err, stdout, stderr){

		if( err ){
			console.error( 'failed to install ' + version + ', continuing...' )
			next( err, version );
			return;
		}

		var  src = path.join( 'node_modules', 'vash' )
			,dest = path.join( 'vashes', version )
		fs.mkdirSync( dest );
		fs.renameSync( src, dest );

		if( !err ) next( err, version )
	})
}

var clean = function(next){
	if( fs.existsSync('vashes') ){
		wrench.rmdirSyncRecursive( 'vashes' )
	}
	wrench.mkdirSyncRecursive( 'vashes' );
	next();
}

clean(function(){
	console.log( 'fetching vash versions' );
	getVersions(function(err, versions){
		console.log('found ' + versions.length + ' versions');

		(function install(){
			if( versions.length ){
				installVersion( versions.shift(), install );
			} else {
				console.log('finished installing')
			}
		}())
	})
})
