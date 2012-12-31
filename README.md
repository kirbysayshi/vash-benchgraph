Vash Benchgraph
===============

This is a command line tool that enables various versions of Vash to be easily run against test templates ("is it faster?"). It also enables diffing of the compiled templates ("why is it faster?"), diffing of the rendered output ("is it faster because it's broken?") and outputs a graph visually showing results ("how much faster?").

Each template file has a JS-based 'front matter' that enables per-template Vash configuration, display name, and defining a model (which is just JS, not JSON). This enables a new test to be added simply by adding a single template file to the `templates` directory.

This is mostly meant as a personal development tool, specifically for [Vash](https://github.com/kirbysayshi/vash). Just as Mozilla has [Are We Fast Yet](http://arewefastyet.com/), it's useful to have a baseline to compare changes against.

Usage
-----

Step one is to install all versions of vash using:

	$ node install-all.js

Then use `benches.js`:

````
$ node benches.js --help

  Usage: benches.js [options]

  Options:

    -h, --help                      output usage information
    -ve, --vexclude <versions>      Comma-delimited semver versions of vash to exclude from the benchmarks
    -vi, --vinclude <versions>      Comma-delimited semver versions of vash to include in the benchmarks
    -te, --texclude <filenames>     Comma-delimited template filenames to exclude
    -ti, --tinclude <filenames>     Comma-delimited template filenames to include
    -l, --localversion <vash path>  Provide a `require` path to a local copy of vash to include in benchmarks
    -vs, --versions                 Output valid vash versions and exit
    -c, --chart [columns]           Output a chart instead of JSON, with optional comma-delimited column names: vashv,bar,ops,rme,percent,om,xfast
    -d, --dump                      Output the decompiled templates without benchmarking
    -dc, --diffcompiled             Diff the decompiled templates without benchmarking
    -vf, --verify                   Diff the rendered template output instead of benchmarking, using newest version as base
    -v, --verbose                   More output
````

Example commands:

````
$ node benches.js --tinclude 004.vash --vinclude "0.5.13-1800" --localversion ../vash/build/vash --chart vashv,bar,ops,om
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
004.vash Small - no html escape
0.5.13-1800 ●●●●●●●●●●●●●●●●●●●●●                                                                                                                               195,531 ops/s       5.3 mag
0.5.13-1803 ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●● 1,328,963 ops/s     6.1 mag
````

````
$ node benches.js --tinclude 004.vash --vinclude ">0.5.2" --localversion ../vash/build/vash --chart vashv,bar,om
--------------------------------------------------------------------------------------------------------------------------------------------------------
004.vash Small - no html escape
0.5.2-1183  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                      
0.5.2-1236  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                       
0.5.2-1239  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                        
0.5.3-1255  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                             1 order  
0.5.3-1272  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                               1 order  
0.5.3-1292  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                                  1 order  
0.5.3-1294  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                            1 order  
0.5.4-1385  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                        1 order  
0.5.4-1386  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                         1 order  
0.5.5-1514  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                                     1 order  
0.5.6-1543  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                                                                                                  1 order  
0.5.6-1544  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                                                                                                  1 order  
0.5.6-1545  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                                                 1 order  
0.5.7-1547  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                                            1 order  
0.5.9-1729  ●●●●●●●●●●●●●●●●●●●●●                                                                                                              1 order  
0.5.10-1739 ●●●●●●●●●●●●●●●●●●●●●                                                                                                              1 order  
0.5.11-1767 ●●●●●●●●●●●●●●●●●●●●                                                                                                               1 order  
0.5.12-1773 ●●●●●●●●●●●●●●●●●●●●                                                                                                               1 order  
0.5.13-1800 ●●●●●●●●●●●●●●●●●●●●●                                                                                                              1 order  
0.5.13-1802 ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●  
````

````
# the diff is colorized in Terminal, colors are missing here

$ node benches.js --tinclude 004.vash --vinclude "0.5.2-1239" --localversion ../vash/build/vash --diffcompiled
0.5.2-1239, 0.5.13-1802
1  | function anonymous(model,html,__vopts) {
2  | html = html || vash.helpers; 
3  | html.__vo = html.__vo || []; 
4  | var __vbuffer__vo = html.buffer__vo; 
5  | html.model = model; || {}; 
6  | __vbuffer__vo.push('\n<div class=\"widget\">\n	<p>'); 
7  | __vbuffer__vo.push(model.somevar); 
8  | __vbuffer__vo.push('</p>\n	<p>'); 
9  | __vbuffer__vo.push(model.anothervar); 
10 | __vbuffer__vo.push('</p>\n</div>\n'); 
11 | (__voptsdelete && __voptshtml.onRenderEnd__vo; && __vopts.onRenderEnd(null, html)); 
12 | return (__vopts && __vopts__vo.asContext)join(''); 
13 |   ? html 
14 |   : html.toString(); 
15 | 
16 | }
````

A few internal components may be useful to others:

cli-rows.js
-----------

Since [cli-table](https://github.com/LearnBoost/cli-table) is taken, this is a dumb name for a simple way to output a table to the command line. Why make another? Primarily because I wanted it to have auto-expand capabilities. It supports the following:

* Percentage based column widths
* Absolute column widths
* Autoexpand a single column to fill the remaining width (column with width of `*`)
* Print rows as they are added or all at once

````js
var table = new Table({
	columns: [
		 { title: 'Column 1', key: 'col1', width: '30%' }
		,{ title: 'Column 2', key: 'col2', width: '*' }
		,{
			 title: 'Column 3'
			,key: 'col3'
			,width: 0.5 // can be percentage, decimal percentage, or absolute column count
			// modify each value in this column before printing
			,cb: function(value){ return '\u001b[38;5;71m' + value + '\u001b[39m' }
		}
	]
	// use the following values as repeater when padding
	,paddingLeft: ' '
	,paddingRight: ' '
	// defaults to current terminal width
	,width: process.stdout.columns
	// if content overflows, use this character
	,ellipses: '\u2026'
})
````

Then adding a row:

````js
table.addRow([
	// if a callback is passed, it overrides one defined for the row
	 { key: 'col1', value: 'Hey!', cb: function(val){ return '>>' + val + '<<' } }
	,{ key: 'col2', value: 'This column autoexpands' }
	,{ key: 'col3', value: 'This column takes up half the table' }
])
````
