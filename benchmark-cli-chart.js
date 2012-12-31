var clc = require('cli-color')
	,Table = require('./cli-rows')
	,utils = require('./utils')

	,_ = require('lodash');

var BenchmarkCliChart = module.exports = function( suite, options ){
	this.options = options || {};
	this.suite = suite;

	if( this.options.fields && this.options.fields.length ){
		var fields = {};
		this.options.fields.forEach(function(f){
			fields[f] = true;
		})
		this.options.fields = fields;
	}

	this.suite.on('cycle', this.suiteOnCycle.bind(this))
	this.suite.on('complete', this.suiteOnComplete.bind(this))
}

BenchmarkCliChart.prototype = {

	suiteOnCycle: function( ev ){
		process.stdout.write( '\rFinished ' + ev.target.name + ', ' + ~~ev.target.hz );
	}

	,suiteOnComplete: function( ev ){

		var  self = this
			,columns = []

		this.headerColumn( columns, 'vashv', null, 12 );
		this.headerColumn( columns, 'bar', null, '*' );
		this.headerColumn( columns, 'ops', 'ops/sec', 20 );
		this.headerColumn( columns, 'rme', 'relative error margin', '5%' );
		this.headerColumn( columns, 'percent', '% slower', '7%' );
		this.headerColumn( columns, 'om', 'magnitude', '6%' );
		this.headerColumn( columns, 'xfast', 'times faster than the slowest', '7%' );

		process.stdout.write( '\r' );

		var table = new Table({
			columns: columns
		})

		var  fastestBench = this.suite.filter('fastest')
			,slowestBench = this.suite.filter('slowest')
			,fastestColor = clc.xterm(71)
			,slowestColor = clc.xterm(167)
			,fastestHz = fastestBench[0].hz
			,slowestHz = slowestBench[0].hz
			,xFastest = this.xFaster( fastestHz, slowestHz )
			,self = this

		// print out a giant line and the suite name
		console.log( Array(table.options.width + 1).join('-') );
		console.log( this.suite.name );
		//table.printHeader();

		this.suite.forEach(function( bench ){

			var  phz = bench.hz / fastestHz
				,pslow = ( ( 1 - phz ) * 100 ).toFixed(2)
				,barWidth = ~~( phz * table.column( 'bar' ).innerWidth() )
				,bar = Array( barWidth + 1 ).join('\u25CF')
				,cb = Table.I
				,om = self.magnitude( bench.hz )
				,xFaster = xFastest - self.xFaster( fastestHz, bench.hz )

				,columns = []

			if( fastestBench.indexOf(bench) > -1 ){
				cb = fastestColor;
			} else if( slowestBench.indexOf(bench) > -1 ){
				cb = slowestColor;
			}

			self.dataColumn( columns, 'vashv', bench.name );
			self.dataColumn( columns, 'bar', bar, cb );
			self.dataColumn( columns, 'ops', utils.humanize( ~~bench.hz ) + ' ops/s' );
			self.dataColumn( columns, 'rme', '+/-' + bench.stats.rme.toFixed(2) );
			self.dataColumn( columns, 'percent', pslow >= 1 ? ~~pslow + '% slower' : '' );
			self.dataColumn( columns, 'om', om + ' mag' );
			self.dataColumn( columns, 'xfast', xFaster > 1 ? xFaster + 'x faster' : '' );

			table.addRow( columns );
		});

		console.log( '' );
	}

	,xFaster: function( fastest, slowest ){
		return ~~(fastest / slowest)
	}

	,magnitude: function( slowest ){

		var sorder = Math.log(slowest)/Math.LN10
		return sorder.toFixed(1);
	}

	,headerColumn: function( columns, key, title, width ){
		if( this.options.fields && this.options.fields[key] ){
			var col = { key: key, width: width, paddingLeft: '' }
			if( title ){ col.title = title; }
			columns.push( col );
		}
	}

	,dataColumn: function( columns, key, value, cb ){
		if( this.options.fields && this.options.fields[key] ){
			columns.push( { key: key, value: value, cb: cb } );
		}
	}
}