#!/usr/bin/env node

/*
	ChwiM-aidd (Chwiliwr Mynegiadau Rheolaidd i adnoddau LlGC)
	(h) 2023-4 Geiriadur Prifysgol Cymru, Canolfan Uwchefrydiau Cymreig a Cheltaidd, Prifysgol Cymru y Drindod Dewi Sant
	(c) 2023-4 University of Wales Dictionary, Centre for Advanced Welsh and Celtic Studies, University of Wales Trinity St David
	gan / by Dr Talat Zafar Chaudhri
	
	Fersiwn / Version 0.4
	Gweler / See release_notes_v0.4.txt
*/

// port

const port = process.env.PORT || 8080; // configurable with fallback to 8080

// dependencies

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
//const tls = require('tls');

const cheerio = require("cheerio");
//const pretty = require("pretty"); // not required: merely tidies html output
const genex = require('genex');

//constants

const delay_in_ms = 1000; // DO NOT SET LOWER THAN 1000 FOR NLW SERVERS
//const sourceURL1 = 'https://cylchgronau.llyfrgell.cymru/';
//const sourceURL2 = 'https://papuraunewydd.llyfrgell.cymru/';
const requestLimit = 120; // Default 120. Less than 2 will disable searching both CC & PN. Most browsers will timeout before this anyway. If delay_in_ms is 1000, this will be over 2 mins.

// HTML DOCS

const html5_frag1 = fs.readFileSync("./html5/frag1.html.txt");
const html5_frag2 = fs.readFileSync("./html5/frag2.html.txt");

// CREATE SERVER
http.createServer(async function (req, res) {
	var sourceURL1;
	var sourceURL2;
	var order;
	var outputFormat;
	var sources; // 0 = both; 1 = PN; 2 = CC
	var q = url.parse(req.url, true);
	var GETData = req.url.split('?')[1]; // to pass GET data to NLW services
	var data = q.query;
	// Remove bug with second instance of query= taking precedence (which could be an unexpanded regex)
	if (GETData && GETData.indexOf("&") != -1) { // make sure that GETData contains & before altering parameters
		//console.log("TEST1: "+GETData);
		var GETDataArray = GETData.split("query="); // split query= as GETData[0] from remainder as GETData[1]
		if (GETDataArray[0].length == 0) { // this checks that we are in fact removing query= because otherwise we should stop
			GETData = GETDataArray[1]; // remainder as string }
			GETDataArray = GETData.split("&"); // split array by &
			GETDataArray.shift(); // remove first item (after query=) from rest of query string
			GETData = GETDataArray.join("&"); // join the remainder between & characters again
			// result removes query=[whatever] from other parameters
		} //else { GETData = GETDataArray[0] } // unnecessary
	}
	var path = q.pathname; // sets the path
	console.log(path); // Show path on console
	
	var advanced = 0; // default
	// Parse 'advanced' parameter
	if ("advanced" in data && data['advanced'].toLowerCase() == "true") {
		advanced = 1; // advanced search
	}
	else {
		advanced = 0; // Default to 0 = normal search
	}
	
	var interface = "cy"; // default
	// Parse 'interface' parameter
	if ("interface" in data && data['interface'].toLowerCase() == "en") {
		interface = "en"; // interface search
	}
	else if ("interface" in data && data['interface'].toLowerCase() == "cy") {
		interface = "cy"; // interface search
	}
	else { // check browser language
		var acceptLang = acceptLang();
		if (acceptLang != "") {
			interface = acceptLang;
		}
		else {
			interface = "cy"; // Default to cy
		}
	}
	
	if (interface == "en") {
		sourceURL1 = 'https://journals.library.wales/';
		sourceURL2 = 'https://newspapers.library.wales/';
	}
	else { // cy
		sourceURL1 = 'https://cylchgronau.llyfrgell.cymru/';
		sourceURL2 = 'https://papuraunewydd.llyfrgell.cymru/';
	}
	
	var allowedFiles = ["assets/css/results.css", "form-cy.html", "form-en.html", 
		"form-advanced-cy.html", "form-advanced-en.html",
		"assets/css/style.css",
		"vendor/jquery/jquery-3.7.1.min.js",
		"assets/js/form-cy.js", "assets/js/form-en.js",
		"assets/Mynegiadau_Rheolaidd.html",
		"assets/Regular_Expressions.html"
		];
	
	if (path.endsWith("/search") || path.endsWith("/search/")) {
		// DO NOTHING UNLESS:
	}
	//else if (path.endsWith("style.css")) { // Allow style.css
	else if (allowedFiles.some(allowedFile => path.endsWith(allowedFile))) {
		//filename = path.substring(path.lastIndexOf("/") + 1); // did not allow sub-folders
		//filename = path.substring(path.indexOf("/") + 1); // only allowed one sub-folder
		var filename;
		allowedFiles.some((allowedFile) => {
			if (path.endsWith(allowedFile)) {
				filename = allowedFile;
			}
		});
		fs.readFile(filename, "utf8", function(err, data) {
			//fs.readFile("./style.css", "utf8", function(err, data) {
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				//console.log(allowedFile); // testing only
				return res.end("404 Nis Cyrchwyd y ffurflen / Not Found");
			}
			// Check file is not empty (general check)
			if (data.length == 0) {
				return res.status(422).json({message : "Ffeil yn wag / File is empty!"});
			}
			//else { console.log("File isn't empty");} // TESTING
			if (filename.endsWith(".css")){ res.writeHead(200, {'Content-Type': 'text/css'}); }
			else if (filename.endsWith(".html") || filename.endsWith(".htm")){ res.writeHead(200, {'Content-Type': 'text/html'}); }
			else if (filename.endsWith(".js")){ res.writeHead(200, {'Content-Type': 'text/javascript'}); }
			else { res.writeHead(200, {'Content-Type': 'text/html'}); }
			res.write(data);
			return res.end();
		});
	return;
	}
	else if (!path.includes(".")) { // Disallow folders with dots in them or file extensions, then proceed
		// Add a trailing slash
		//if (!path.endsWith("/")) { path += "/"; } // no longer required?
		function checkAdvanced(advanced) { if (advanced == 1) { return "-advanced"; } else { return ""; }
		//function checkInterface(interface) { if (interface == "cy") { return "-cy"; } else if (interface == "en") { return "-en"; } else { return "-cy"; }
		}
		// Check for error BEFORE checking if file is empty (bug fix to avoid crash if file missing)
		fs.readFile("./form"+checkAdvanced(advanced)+"-"+interface+".html", "utf8", function(err, data) {
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				return res.end("404 Nis Cyrchwyd / Not Found");
			}
			// Check file is not empty (general check)
			if (data.length == 0) {
				return res.status(422).json({message : "Ffeil yn wag / File is empty!"});
			}
			//else { console.log("File isn't empty");} // TESTING
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(data);
			return res.end();
		});
		return;
	}
	else {
		// Anything else, i.e. it does contain a dot
		res.writeHead(404, {'Content-Type': 'text/html'});
		return res.end("404 Nis Cyrchwyd / Not Found");
	}
	outputFormat = "html"; // default
	// Parse 'output' parameter - how do we want to return the results?
	if ("output" in data && data['output'].toLowerCase() == "xml") {
		outputFormat = "xml"; // XML
		res.writeHead(200, {'Content-Type': 'text/xml'});
	}
	else {
		outputFormat = "html"; // Default to HTML for browser rendering
		res.writeHead(200, {'Content-Type': 'text/html'});
	}
	//res.writeHead(200, {'Content-Type': 'text/html'});
	//res.write(data);
	
	// Set defaults if the parameters in the following section are not supplied
	order = 0;
	//sourceURL = 'https://cylchgronau.llyfrgell.cymru/';
	
	// Parse 'src' parameter to see which resource we want
	if ("src" in data && data['src'].toLowerCase() == "cc") {
		//sourceURL = 'https://cylchgronau.llyfrgell.cymru/';
		sources = 1;
	}
	else if ("src" in data && data['src'].toLowerCase() == "pn") {
		//sourceURL = 'https://papuraunewydd.llyfrgell.cymru/';
		sources = 2;
	}
	else if ("src" in data && data['src'].toLowerCase() == "all") {
		sources = 0;
	}
	else { sources = 0;} // defaults to searching both sites
	//if (requestLimit < 2) { sources = 1; } // Revert to only CC if requestLimit < 2 // Disabled: user unaware of missing results
	
	// Parse 'sort' and 'order' parameters
	if ("sort" in data && data['sort'].toLowerCase() == "date") {
		if ("order" in data && data['order'].toLowerCase() == "asc") {
			order = 1;
		}
		if ("order" in data && data['order'].toLowerCase() == "desc") {
			order = 2;
		}
	}	
	
	// IF THERE IS A QUERY, DO SOMETHING
	if ("query" in data && data['query'] !== "") {
		
		// CREATES LIST OF QUERIES
		//const pattern = genex(/(ffoo|bar|baz){1,2}|snafu/);
		//var pattern = genex((data['query'].toString())); // Crashes on invalid regex
		// Handle invalid regex and return error
		var pattern;
		try {
			pattern = genex((data['query'].toString()));
			//} catch(err) {res.end(html5_frag1+"<h2>"+"Mynegiad rheolaidd annilys / Invalid regular expression</h2>"+html5_frag2); return;}
		} catch(err) {res.end(html5_frag1+"<h2>"+"Mynegiad rheolaidd annilys</h2>"+html5_frag2); return;}
		
		//regex = pattern.generate().toString(); // does not add space after comma
		regex = pattern.generate().join(', '); // adds space after comma
		// Enforce quotation marks if any of the expanded search terms contains
		//if (regex.includes(' ') || regex.includes('-')) {
		if (containsSpecialChars(regex) || regex.includes(' ')) {
			// re-formulate the expansion with quotation marks
			pattern = genex(("\""+data['query']+"\"".toString()));
			//regex = pattern.generate().toString(); // does not add space after comma
			regex = pattern.generate().join(', '); // adds space after comma
		}
		// Expand/print query if 'regex' == "true" /* and stop output */
		if ("regex" in data && data['regex'].toLowerCase() == "true") {
			console.log(data['query'].toString()); // outputs the regex to console.
			console.log(regex); // outputs a comma separated list of search terms from the regex to console
			//res.write(regex); // serves the comma separated list of search terms from the regex as http response
			regex = "\n\t\t\t<h2>" + regex + "</h2>"; // enclose regex in tags
			//return;
		}
		else { regex = ""; }

		await createMultipleRequests(regex, pattern, order, outputFormat, sources, GETData); // send all the requests

	}
	// THERE IS NO QUERY
	else {
		// ensures that the request ends
		//res.end(html5_frag1+"Dim termau chwilio / No search terms</h2>"+html5_frag2);
		res.end(html5_frag1+"Dim termau chwilio</h2>"+html5_frag2);
	}
	
	function timestamp(date, lang) { // converts Welsh date to UNIX timestamp
		const months_cy = [
			"Ionawr", "Chwefror", "Mawrth", "Ebrill", "Mai", "Mehefin", "Gorffennaf",
			"Awst", "Medi", "Hydref", "Tachwedd", "Rhagfyr"
		];
		const months_en = [
			"January", "February", "March", "April", "May", "June", "July",
			"August", "September", "October", "November", "December"
		];
		//date = date.replace(/(\n?\t?\t\t\t\t)+/g,' ').trim(); // WORKS (VERY SPECIFIC)
		//date = date.replace(/[\t\n\r]+/g,' ').trim(); // WORKS (MORE VERBOSE)
		date = date.replace(/\s+/g,' ').trim(); // WORKS (SIMPLEST)
		if (lang == "en") { // If lang = en adjust the date to remove ordinal parts
			dateArray = date.split(' '); // split the string after each space
			dateArray[0] = dateArray[0].replace(/(st|nd|rd|th)/g, ''); // remove st, nd, rd, th
			date = dateArray.join(' '); // Convert the array back into a string with spaces reinserted
		}
		var parts = date.split(" ").map(function(item) {
			//return item.trim(); // Unnecessary because already trimmed above.
			return item;
		});
		//console.log(parts); // TESTING
		if (lang == "en") {
			var d = parts[2]+'-'+(months_en.indexOf(parts[1])+1).toString().padStart(2, '0')+'-'+parts[0].padStart(2, '0')+'T00:00:00.000Z';
			//return (d.getTime());
			return new Date(d).getTime();
		}
		else {
			var d = parts[2]+'-'+(months_cy.indexOf(parts[1])+1).toString().padStart(2, '0')+'-'+parts[0].padStart(2, '0')+'T00:00:00.000Z';
			//return (d.getTime());
			return new Date(d).getTime();
		}
	}
	
	function outputArray(array, order) { // 1 = forward (asc), 2 = reverse (desc)
		
		//sort by timestamp
		// use slice() to copy the array and not just make a reference
		console.log(array);
		var arrayLength = array.length; // get number of items
		var data = array.slice(0); // copies whole array from 0 to end
		//console.log(data);
		if (order == 1 || order == 2) {
			data.sort(function(a,b) {
				num = a.timestamp - b.timestamp;
				//console.log(num); // TESTING
				return a.timestamp - b.timestamp;
			});
		}
		if (order == 2) { data.reverse(); }
		data.forEach(function(n) { console.log(n['timestamp']) });  // prints each 'timestamp' field from array to console
		var output = "";
		data.map(function(n) { output += n['html'] });  // prints each 'html' field from array to variable
		
		console.log("\""+output+"\"");
		console.log("Number of items: "+arrayLength);
		return output; // return value to be included in the server response, which is waiting for it
	}
	
	function returnHTMLArray(request_data) {
		
		arrayOfObjects = [];
		const $ = cheerio.load(request_data);
		
		// Find all div elements with a class of "example" using the class selector
		const items = $(".result"); // returns search items
		//const items = $('[class="result"]'); // should be equivalent to the above
		//const date = $(".result div.col-xs-2:eq(1), .result li.col-sm-2:eq(0) > span"); // returns just dates of search items
		
		// Add appropriate path to result link (CC)
		$('.col-xs-12.result > h2.result-title a').attr('href', function(index, attr) {return sourceURL1+attr;});
		// Add appropriate path to result link (PN)
		$('.col-md-12.result > h2.result-title a').attr('href', function(index, attr) {return sourceURL2+attr;});
		// Add appropriate path to source link in CC (N.B. no need in PN as already there: would create duplicate)
		$('div.col-xs-5 > a').attr('href', function(index, attr) {return sourceURL1+attr;});
		
		// Iterate over each div element to get the html, timestamp and date, and put into array
		items.each((i, item) => {
			if (item) {
				// Replaces the above variable 'date' so that the timestamp is correct per item
				const $ = cheerio.load(item);
				date = $(".result div.col-xs-2:eq(1), .result li.col-sm-2:eq(0) > span");
				// Be careful to add it to the array correctly like this, or else it won't be parsed properly
				//arrayOfObjects = [{'html': $(item).html(), 'timestamp': timestamp($(date).html()), 'date': $(date).html()}]; // PROBLEM!
				//arrayOfObjects = arrayOfObjects.concat({'html': $(item).html(), 'timestamp': timestamp($(date).html()), 'date': $(date).html()}); // FIXED
				if (outputFormat == "xml") {
					resource = $(".result-title > a").attr("href"); resource = escape(resource);
					text = $(".result-summary > span.hidden-xs").text(); text = escape(text);
					source = $(".result-meta > .col-xs-6 > a, .result-metadata > .col-xs-5 > a").attr("href"); source = escape(source);
					dateXML = $(".result div.col-xs-2:eq(1), .result li.col-sm-2:eq(0) > span").text(); dateXML = escape(dateXML);
					dateXML = timestamp(dateXML, interface);
					const myDate = new Date(dateXML);
					//dateXML = myDate.toLocaleDateString("en-UK"); // DD/MM/YYYY
					dateXML = myDate.toISOString().split('T')[0]; // YYYY-MM-DD
					//dateXML = "<date>" + date + "</date>";
					//arrayOfObjects = arrayOfObjects.concat({'html': $(item).html(), 'timestamp': timestamp($(date).html()), 'date': $(date).html()});
					arrayOfObjects = arrayOfObjects.concat({'html': "<item><resource>"+resource+"</resource><text-summary>"+text+"</text-summary><source>"+source+"</source><date>"+dateXML+"</date></item>", 'timestamp': timestamp($(date).html(), interface), 'date': $(date).html()});
				}
				else {
					var classLabel;
					if ($(".result-title > a") ) {
						if ($(".result-title > a").attr('href').includes("cylchgronau") ) { classLabel = "cc" }
						if ($(".result-title > a").attr('href').includes("papuraunewydd") ) { classLabel = "pn" }
						if ($(".result-title > a").attr('href').includes("journals") ) { classLabel = "cc" }
						if ($(".result-title > a").attr('href').includes("newspapers") ) { classLabel = "pn" }
					}
					arrayOfObjects = arrayOfObjects.concat({'html': "<div class='" + classLabel + "'>" + $(item).html() + "</div>", 'timestamp': timestamp($(date).html(), interface), 'date': $(date).html()}); // AS ABOVE BUT ADD DIV ID FOR CSS
					//arrayOfObjects = []; // NOT HERE!!
				}
			}
		});
		return arrayOfObjects;
	}
	
	function serverRequest (val, sourceURL, GETData, callback) {
		
		var arrayOfMultipleObjects = [];
		
		// MAKES A REQUEST TO THE WEB SERVICE FOR EACH REQUEST
		// Added pass-through of GET data
		//GETdata
		https.get(sourceURL+'search?query='+val+'&rows=1000'+'&'+GETData, (resp) => { // server will run out of memory over ~1000
			
			// SET UP REQUEST
			let request_data = '';
			//let request_data = [];
			
			const headerDate = resp.headers && resp.headers.date ? resp.headers.date : 'no response date';
			//console.log('Status Code:', resp.statusCode);
			//console.log('Date in Response header:', headerDate);
			
			// A chunk of data has been received.
			resp.on('data', (chunk) => {
				request_data += chunk;
				//request_data[0].push(chunk);
				//callback('test'); // NOT REQUIRED HERE
			});
			
			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				arrayOfMultipleObjects = returnHTMLArray(request_data); // returns data
				callback(arrayOfMultipleObjects); // necessary to make sure that it works?
				// CATCH ERRORS
				}).on("error", (err) => {
				console.error("Error: "+err);
				console.log("Error: " + err.message); // never called?
				/* Does not work
					}).on("uncaughtException", (err) => {
					console.log("Uncaught Exception: " + err.message);
				*/
			});
			resp.on("error", (err) => { // Does not work either
				console.error("Error! "+err);
				//console.log("Error! "+err.message);
				//throw (err);
			});
		});
	}
	
	async function createMultipleRequests(regex, pattern, order, outputFormat, sources, GETData) {
		
		var output = "";
		var finalArrayOfObjects = [];
		// CREATES ARRAY OF REQUESTS
		requests = pattern.generate();
		var numOfRequests = requests.length; // SET COUNTER LENGTH
		if (sources == 0) { numOfRequests *= 2; } // DOUBLE COUNTER LENGTH IF SEARCHING BOTH CC & PN (EFFECTIVELY HALVING REQUESTS CEILING)
		if (numOfRequests > requestLimit) { output = "<h2>Mynegiad rheolaidd yn rhy gymhleth ("+requests.length+" * "+numOfRequests/requests.length+" = "+numOfRequests+" / "+requestLimit+") .</h2>"; return; }
		
		var counter = 0; // set up counter
		for(const val of requests) {
			// ITERATES ARRAY OF REQUESTS
			//console.log(val); // outputs search terms from the regex to console iteratively (TESTING)
			
			//combinedArrayOfMultipleObjects += serverRequest(val); // SEND REQUEST TO SERVER
			
			if (sources == 0 || sources == 1) {
				//sourceURL = sourceURL1;
				serverRequest(val, sourceURL1, GETData, function(results){
					counter++; handleResults(results);
				});
				// CRUCIAL DELAY TO PREVENT HITTING SERVER TOO HARD
				await new Promise(resolve => setTimeout(resolve, delay_in_ms));
				console.log("::"); // TESTING
			}
			if (sources == 0 || sources == 2) {
				//sourceURL = sourceURL2;
				serverRequest(val, sourceURL2, GETData, function(results){
					counter++; handleResults(results);
				});
				// CRUCIAL DELAY TO PREVENT HITTING SERVER TOO HARD
				await new Promise(resolve => setTimeout(resolve, delay_in_ms));
				console.log("::"); // TESTING
			}
		}
		//numOfRequests = 0; // NOT REQUIRED
		//combinedArrayOfMultipleObjects = []; // NOT HERE
		
		function handleResults(results){
			//do something with the results
			finalArrayOfObjects = finalArrayOfObjects.concat(results);
			//counter++;
			if (numOfRequests == counter) {
				//output = outputArray(finalArrayOfObjects, 1); // 1 = forward (asc), 2 = reverse (desc)
				output += outputArray(finalArrayOfObjects, order); // 1 = forward (asc), 2 = reverse (desc)
				/* counter = 0; */
				printOutput();
			}
			// results are returned via output
			else {
				return finalArrayOfObjects;
			} 
		}
		
		function printOutput() {
			var noResults;
			if (interface == "en") {
				noResults = "No Results";
			}
			else {
				noResults = "Dim canlyniadau";
			}
			if (output != "") {
				//res.end(html5_frag1+output+html5_frag2); // outputs results
				// GET NUMBER OF CC and PN results
				var numOfCC;
				var numOfPN;
				var msgText;
				var CCLabel;
				var PNLabel;
				var noResults;
				if (interface == "en") {
					numOfCC = finalArrayOfObjects.filter((item) => item.html.includes("journals")).length;
					numOfPN = finalArrayOfObjects.filter((item) => item.html.includes("newspapers")).length;
					msgText = "Number of results";
					CCLabel = "WJ";
					PNLabel = "WN";
				}
				else { // cy
					numOfCC = finalArrayOfObjects.filter((item) => item.html.includes("cylchgronau")).length;
					numOfPN = finalArrayOfObjects.filter((item) => item.html.includes("papuraunewydd")).length;
					msgText = "Nifer o ganlyniadau";
					CCLabel = "CC";
					PNLabel = "PN"
				}
				//var numTotal = finalArrayOfObjects.length;
				var numTotal = numOfCC + numOfPN;
				if (sources == 1 || sources == 0) console.log('CC: '+numOfCC);
				if (sources == 2 || sources == 0) console.log('PN: '+numOfPN);
				if (outputFormat == "xml") {
					res.end('<?xml version="1.0" encoding="UTF-8"?><results>'+output+'</results>'); // output as XML
				}
				else { // HTML
					if (sources == 0) {
						//res.end(html5_frag1+regex+'<h2>Nifer o ganlyniadau: '+numTotal+' (CC: '+numOfCC+'\, PN: '+numOfPN+')'+'</h2>'+output+html5_frag2); // adds regex expansion/checking output before results
						res.end(html5_frag1+regex+'<h2>'+msgText+': '+numTotal+' ('+CCLabel+': '+numOfCC+'\, '+PNLabel+': '+numOfPN+')'+'</h2>'+output+html5_frag2); // adds regex expansion/checking output before results
					} else if (sources == 1) {
						//res.end(html5_frag1+regex+'<h2>Nifer o ganlyniadau (CC): '+numTotal+'</h2>'+output+html5_frag2); // adds regex expansion/checking output before results
						res.end(html5_frag1+regex+'<h2>'+msgText+' ('+CCLabel+'): '+numTotal+'</h2>'+output+html5_frag2); // adds regex expansion/checking output before results
					} else if (sources == 2) {
						//res.end(html5_frag1+regex+'<h2>Nifer o ganlyniadau (PN): '+numTotal+'</h2>'+output+html5_frag2); // adds regex expansion/checking output before results
						res.end(html5_frag1+regex+'<h2>'+msgText+' ('+PNLabel+'): '+numTotal+'</h2>'+output+html5_frag2); // adds regex expansion/checking output before results
					}
				}
			}
			else {
				//res.end(html5_frag1+regex+"\n\t\t\t<h2>"+"Dim canlyniadau / No results</h2>"+html5_frag2); // adds regex expansion/checking output
				res.end(html5_frag1+regex+"\n\t\t\t<h2>"+noResults+"</h2>"+html5_frag2); // adds regex expansion/checking output
			}
		}
	}
	
	function containsSpecialChars(str) {
		const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|.<>\/?~]/; // special characters other than comma (delimiter)
		return specialChars.test(str);
	}
	function escape(htmlStr) {
		if (htmlStr) {
			return htmlStr.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#39;");
		}

	}
	
	function acceptLang () {
		var acceptLang;
		acceptLang = req.headers["accept-language"];
		if (typeof acceptLang === "string" && acceptLang.length != 0) { // better than checking != ""
			acceptLangArray = acceptLang.split(','); // get first lang in sequence
			acceptLang = acceptLangArray[0]; // put string back together
		}
		if (typeof acceptLang === "string" && acceptLang.length != 0) { // better than checking != ""
			acceptLangArray = acceptLang.split("-"); // removes -gb, -us etc
			acceptLang = acceptLangArray[0]; // put string back together
		}
		return acceptLang;
	}
	
// END OF SERVER CODE
}).listen(port);
