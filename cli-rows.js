var _ = require('lodash')

function padr( str, max, chr ){
	var len = max - str.length;
	return (str + Array( len > -1 ? len + 1 : 0 ).join( chr )).substring(0, max);
}

function padl( str, max, chr ){
	var len = max - str.length;
	return (Array( len > -1 ? len + 1 : 0 ).join( chr ) + str).substring(0, max);
}

function undefDefault( value, option ){
	return typeof value === 'undefined'
		? option
		: value;
}

var Column = function( options ){

	this.title = options.title || '';
	this.key = options.key || '';
	this.width = options.width || 1;
	this.cb = options.cb || Table.I;

	this.paddingLeft = undefDefault( options.paddingLeft, ' ' );
	this.paddingRight = undefDefault( options.paddingRight, ' ' );
}

Column.prototype.innerWidth = function innerWidth(){
	return this.width - this.paddingLeft.length - this.paddingRight.length;
}

var Table = module.exports = function( options ){

	this.options = _.defaults( options, {
		columns: [
			 { title: 'Column 1', key: 'col1', width: '30%' }
			,{
				 title: 'Column 2'
				,key: 'col2'
				,width: 0.7
				,cb: function(value){ return '\u001b[38;5;71m' + value + '\u001b[39m' }
			}
		]
		,paddingLeft: ' '
		,paddingRight: ' '
		,width: process.stdout.columns
		,ellipses: '\u2026'
	})

	this.columns = {};
	this.rows = [];

	this.initColumns();
}

Table.parsePercent = function( str ){
	var  rePercentage = /(\d+\.?\d*)%/
		,result = rePercentage.exec(str);

	if( result ){
		return parseFloat( result[1], 10 ) / 100;
	} else {
		return str;
	}
}

Table.toAbsoluteUnit = function( max, width ){
	var percent = Table.parsePercent( width );

	if( percent === width ){
		// not a percentage

		if( width < 1 ){
			// numeric percentage
			return width * max;
		}

		if( width >= 1 ){
			// absolute column count
			return width;
		}

	} else {
		// is a percentage
		return percent * max;
	}
}

Table.I = function(x){ return x }

Table.prototype.initColumns = function(){
	var  maxWidth = Table.toAbsoluteUnit( this.options.width, this.options.width )
		,defaultWidth = ~~(maxWidth / this.options.columns.length)
		,self = this
		,starColumn;

	function columnWidth( opts ){
		return opts.width
			? ~~( Table.toAbsoluteUnit( maxWidth, opts.width ) )
			: defaultWidth;
	}

	// find index of auto-expanding column, if any.
	// this assumes ONLY ONE.
	var starIdx = this.options.columns.reduce(function( prev, curr, idx ){
		if( curr.width === '*' ){ return idx }
		else return prev;
	}, -1);

	// calculate remaining column count
	var remaining = this.options.columns.reduce(function(prev, curr){
		return prev - columnWidth( curr );
	}, maxWidth);

	// set star column to the string percentage
	if( starIdx > -1 ){
		this.options.columns[ starIdx ].width = (remaining / maxWidth);
	}

	this.options.columns.forEach(function( opts ){

		_.defaults(opts, {
			 paddingLeft: self.options.paddingLeft
			,paddingRight: self.options.paddingRight
		})

		opts.width = opts.width
			? ~~( Table.toAbsoluteUnit( maxWidth, opts.width ) )
			: defaultWidth;

		self.columns[ opts.key ] = new Column( opts );
	});
}

Table.prototype.column = function( columnKey ){
	return this.columns[ columnKey ];
}

Table.prototype.printHeader = function(){
	var keys = Object.keys(this.columns)
		,self = this
		,rowStr = ''

	var hasHeaders = keys.every(function(key){ return self.columns[key].title !== 'undefined' })

	keys.forEach(function(key){
		var column = self.columns[key]
			,row = self._padding( column.title || '', column.width, column.paddingLeft, column.paddingRight )

		if( column.cb ) row = column.cb( row );
		rowStr += row;
	})

	if( rowStr.length ){
		console.log( rowStr );
	}
}

Table.prototype.addRow = function( columns ){
	var  rowStr = ''
		,self = this

	columns.forEach(function(col){
		var cdat = self.columns[col.key]

		var row = self._padding(
			 col.value
			,cdat.width
			,cdat.paddingLeft
			,cdat.paddingRight
		);

		if( col.cb ) row = col.cb( row );
		else row = cdat.cb( row );

		rowStr += row;
	})

	this.rows.push( rowStr );
	console.log( rowStr );
}

Table.prototype._padding = function( str, width, paddingLeft, paddingRight ){
	var totalpad = paddingLeft.length + paddingRight.length;

	if( str.length + totalpad > width ){
		str = str.substring( 0, width - totalpad - this.options.ellipses.length ) + this.options.ellipses;
	}

	str = paddingLeft + padr( str, width - totalpad, ' ' ) + paddingRight
	return str;
}
