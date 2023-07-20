/*
(h) 2023 Geiriadur Prifysgol Cymru, Canolfan Uwchefrydiau Cymreig a Cheltaidd, Prifysgol Cymru y Drindod Dewi Sant
(c) 2023 University of Wales Dictionary, Centre for Advanced Welsh and Celtic Studies, University of Wales Trinity St David
gan / by Dr Talat Zafar Chaudhri

Fersiwn / Version 0.2
Gweler / See release_notes_v0.2.txt
*/

// dependencies

var https = require('https');
var http = require('http');
var url = require('url');
var fs = require('fs');
//var tls = require('tls');

const cheerio = require("cheerio");
const pretty = require("pretty");

//variables

var finalArrayOfObjects = [];
var numOfRequests;
var counter = 0;
var printOutput;
var trigger = false;
var delay_in_ms = 1000; // DO NOT SET LOWER THAN 1000 FOR NLW SERVERS
var sourceURL = "";
//var sourceURL1 = 'https://cylchgronau.llyfrgell.cymru/';
//var sourceURL2 = 'https://papuraunewydd.llyfrgell.cymru/';
var order = 0;

// HTML DOCS

var html5_frag1 = fs.readFileSync("./html5/frag1.html.txt");
var html5_frag2 = fs.readFileSync("./html5/frag2.html.txt");

// CREATE SERVER
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var data = q.query;
  res.writeHead(200, {'Content-Type': 'text/html'});
  //res.write(data);

  // Set defaults if the parameters in the following section are not supplied
  order = 0;
  sourceURL = 'https://cylchgronau.llyfrgell.cymru/';

  // Parse 'src' parameter to see which resource we want
  if ("src" in data && data['src'].toLowerCase() == "cc") {
    sourceURL = 'https://cylchgronau.llyfrgell.cymru/';
  }
  if ("src" in data && data['src'].toLowerCase() == "pn") {
    sourceURL = 'https://papuraunewydd.llyfrgell.cymru/';
  }

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

    finalArrayOfObjects = [];

    // CREATES LIST OF QUERIES
    const genex = require('genex');
    //const pattern = genex(/(ffoo|bar|baz){1,2}|snafu/);
    const pattern = genex((data['query'].toString()));

    // Expand/print query if 'regex' == "true" /* and stop output */
    regex = pattern.generate().toString();
    if ("regex" in data && data['regex'].toLowerCase() == "true") {
      console.log(data['query'].toString()); // outputs the regex to console.
      console.log(regex); // outputs a comma separated list of search terms from the regex to console
      //res.write(regex); // serves the comma separated list of search terms from the regex as http response
      regex = "\n\t\t\t<h2>" + regex + "</h2>"; // enclose regex in tags
      //return;
    }
    else { regex = ""; }

    createMultipleRequests(pattern);

    trigger = false;
    function wait(param1, param2) {
      if (!trigger) { // !condition CONDITION TO BE MET
        //set timeout(wait(param1, param2), 100); // causes stack error ;-)
        setTimeout(wait, 100, param1, param2) // works
      } else {
        // CODE to launch until condition is met
        if (printOutput != "") {
          //res.end(html5_frag1+printOutput+html5_frag2); // outputs results
          res.end(html5_frag1+regex+printOutput+html5_frag2); // adds regex expansion/checking output before results
        }
        else {
          res.end(html5_frag1+regex+"\n\t\t\t<h2>"+"Dim canlyniadau / No results</h2>"+html5_frag2); // adds regex expansion/checking output
        }
      }
    }
    wait(1, 2); // call wait function (with dummy parameters)
  }
  // THERE IS NO QUERY
  else {
    // ensures that the request ends
    res.end('');
  }

// END OF SERVER CODE
}).listen(8080);

function timestamp(date) { // converts Welsh date to UNIX timestamp
  const months = [
    "Ionawr", "Chwefror", "Mawrth", "Ebrill", "Mai", "Mehefin", "Gorffennaf",
    "Awst", "Medi", "Hydref", "Tachwedd", "Rhagfyr"
  ];
  //date = date.replace(/(\n?\t?\t\t\t\t)+/g,' ').trim(); // WORKS (VERY SPECIFIC)
  //date = date.replace(/[\t\n\r]+/g,' ').trim(); // WORKS (MORE VERBOSE)
  date = date.replace(/\s+/g,' ').trim(); // WORKS (SIMPLEST)
  var parts = date.split(" ").map(function(item) {
    //return item.trim(); // Unnecessary because already trimmed above.
    return item;
  });
  //console.log(parts); // TESTING
  var d = parts[2]+'-'+(months.indexOf(parts[1])+1).toString().padStart(2, '0')+'-'+parts[0].padStart(2, '0')+'T00:00:00.000Z';
  //return (d.getTime());
  return new Date(d).getTime();
}

function outputArray(array, order) { // 1 = forward (asc), 2 = reverse (desc)

  //sort by timestamp
  // use slice() to copy the array and not just make a reference
  console.log(array);
  var data = array.slice(0); // copies whole array from 0 to end
  //console.log(data);
  if (order == 1 || order == 2) {
    data.sort(function(a,b) {
num = a.timestamp - b.timestamp;
console.log(num);
      return a.timestamp - b.timestamp;
    });
  }
  if (order == 2) { data.reverse(); }
  data.forEach(function(n) { console.log(n['timestamp']) });  // prints each 'html' field from array to console
  var localPrintOutput = "";
  data.map(function(n) { localPrintOutput += n['html'] });  // prints each 'html' field from array to variable
  
  console.log("\""+localPrintOutput+"\"");
  return localPrintOutput; // return value to be included in the server response, which is waiting for it
}

function returnHTMLArray(request_data) {

  arrayOfObjects = [];
  const $ = cheerio.load(request_data);

  // OLD SECTION - ONLY CC
  // Find all div elements with a class of "example" using the class selector
  //const items = $("div.col-xs-12.result"); // returns search items
  //const items = $('[class="col-xs-12 result"]'); // should be equivalent to the above
  //const date = $("div.col-xs-12.result div.col-xs-2:eq(1)"); // returns just dates of search items

  // NEW SECTION - CC & PN
  // Find all div elements with a class of "example" using the class selector
  const items = $(".result"); // returns search items
  //const items = $('[class="result"]'); // should be equivalent to the above
  //const date = $(".result div.col-xs-2:eq(1), .result li.col-sm-2:eq(0) > span"); // returns just dates of search items

  // Add appropriate path to result link (CC && PN)
  $('.result > h2.result-title a').attr('href', function(index, attr) {return sourceURL+attr;});
  // Add appropriate path to source link (N.B. no need in PN as already there: would create duplicate)
  $('div.col-xs-5 > a').attr('href', function(index, attr) {return sourceURL+attr;});

  // Iterate over each div element to get the html, timestamp and date, and put into array
  items.each((i, item) => {
    if (item) {
      // Replaces the above variable 'date' so that the timestamp is correct per item
      const $ = cheerio.load(item);
      date = $(".result div.col-xs-2:eq(1), .result li.col-sm-2:eq(0) > span");
      // Be careful to add it to the array correctly like this, or else it won't be parsed properly
      //arrayOfObjects = [{'html': $(item).html(), 'timestamp': timestamp($(date).html()), 'date': $(date).html()}]; // PROBLEM!
      arrayOfObjects = arrayOfObjects.concat({'html': $(item).html(), 'timestamp': timestamp($(date).html()), 'date': $(date).html()}); // FIXED
      //arrayOfObjects = []; // NOT HERE!!
    }
  });
  return arrayOfObjects;
}


function serverRequest (val, callback) {

  // CRUCIAL DELAY TO PREVENT HITTING SERVER TOO HARD - WRONGLY PLACED
  /*
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), delay_in_ms)
  });
  let result = await promise; // wait until the promise resolves (*)
  console.log(result); // 1 TESTING

  await new Promise(resolve => setTimeout(resolve, delay_in_ms));
console.log("test");
  */

  var arrayOfMultipleObjects = [];

  // MAKES A REQUEST TO THE WEB SERVICE FOR EACH REQUEST
  https.get(sourceURL+'search?query='+val+'&rows=1000000', (resp) => {

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
      callback(arrayOfMultipleObjects); // necessary to make sure that 

    // CATCH ERRORS
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    /* Does not work
    }).on("uncaughtException", (err) => {
      console.log("Uncaught Exception: " + err.message);
    */
    });
  });
}

function handleResults(results){
  //do something with the results
  finalArrayOfObjects = finalArrayOfObjects.concat(results);
  counter++;
  if (numOfRequests == counter) {
    //printOutput = outputArray(finalArrayOfObjects, 1); // 1 = forward (asc), 2 = reverse (desc)
    printOutput = outputArray(finalArrayOfObjects, order); // 1 = forward (asc), 2 = reverse (desc)
    counter = 0; trigger = true;
  }
  // results are returned via printOutput
}

async function createMultipleRequests(pattern) {

  // CREATES ARRAY OF REQUESTS
  requests = pattern.generate();
  numOfRequests = requests.length; // SET COUNTER LENGTH
  for(const val of requests) {
    // ITERATES ARRAY OF REQUESTS
    //console.log(val); // outputs search terms from the regex to console iteratively (TESTING)

    //combinedArrayOfMultipleObjects += serverRequest(val); // SEND REQUEST TO SERVER

  // CRUCIAL DELAY TO PREVENT HITTING SERVER TOO HARD
  await new Promise(resolve => setTimeout(resolve, delay_in_ms));
  console.log("::"); // TESTING

    serverRequest(val, function(results){
      handleResults(results);
    });
  }
  //numOfRequests = 0; // NOT REQUIRED
  //combinedArrayOfMultipleObjects = []; // NOT HERE
}