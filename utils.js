var  diff = require('diff')
	,clc = require('cli-color')

// via https://github.com/visionmedia/vbench/blob/master/lib/vbench.js#L105
function humanize(n) {
	var n = String(n).split('.')
	n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
	return n.join('.')
}

function padr( str, max, chr ){
	var len = max - str.length;
	return (str + Array( len > -1 ? len+1 : 0 ).join( chr )).substring(0, max);
}

function padl( str, max, chr ){
	var len = max - str.length;
	return (Array( len > -1 ? len+1 : 0 ).join( chr ) + str).substring(0, max);
}

var linenos = function( str ){
	return str.split('\n').map(function(line, i, arr){
		var max = (arr.length + '').length;
		return padr( (i+1) + '', max, ' ' )
			+ ' | ' + line;
	}).join('\n')
}

var mkDiff = function( expected, expectedLabel, actual, actualLabel ){

	var  expectedColor = clc.xterm(167)
		,actualColor = clc.xterm(71)

	var header = expectedColor( expectedLabel ) + ', ' + actualColor( actualLabel ) + '\n'

	return header + diff.diffWords( expected, actual ).map(function(str){
		if( str.added ){ return clc.xterm(71)(str.value); }
		if( str.removed ){ return clc.xterm(167)(str.value); }
		return str.value;
	}).join('')
}

exports.humanize = humanize;
exports.padr = padr;
exports.padl = padl;
exports.linenos = linenos;
exports.diff = mkDiff;