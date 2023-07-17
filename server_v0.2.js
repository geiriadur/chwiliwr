/*
(h) 2023 Geiriadur Prifysgol Cymru, Canolfan Uwchefrydiau Cymreig a Cheltaidd, Prifysgol Cymru Y Drindod Dewi Sant
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
var sourceURL = 'https://cylchgronau.llyfrgell.cymru/';
//var sourceURL1 = 'https://cylchgronau.llyfrgell.cymru/';
//var sourceURL2 = 'https://papuraunewydd.llyfrgell.cymru/';

// HTML DOCS

var html5_frag1 = fs.readFileSync("./html5/frag1.html.txt");
var html5_frag2 = fs.readFileSync("./html5/frag2.html.txt");

// CREATE SERVER
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  var data = q.query;
  res.writeHead(200, {'Content-Type': 'text/html'});
  //res.write(data);

  // Parse 'src' parameter to see which resource we want
  if ("src" in data && data['src'].toLowerCase() == "cc") {
    sourceURL = 'https://cylchgronau.llyfrgell.cymru/';
  }
  if ("src" in data && data['src'].toLowerCase() == "pn") {
    sourceURL = 'https://papuraunewydd.llyfrgell.cymru/';
  }

  // IF THERE IS A QUERY, DO SOMETHING
  if ("query" in data && data['query'] !== "") {

    finalArrayOfObjects = [];

    // CREATES LIST OF QUERIES
    const genex = require('genex');
    //const pattern = genex(/(ffoo|bar|baz){1,2}|snafu/);
    const pattern = genex((data['query'].toString()));
    //console.log(data['query'].toString()); // SIMPLY OUTPUTS THE REGEX

    //output = pattern.generate().toString(); // FOR TESTING OUTPUT BELOW
    //console.log(output); // outputs a comma separated list of search terms from the regex to console
    //res.write(output); // serves the comma separated list of search terms from the regex as http response

    createMultipleRequests(pattern);

    trigger = false;
    function wait(param1, param2) {
      if (!trigger) { // !condition CONDITION TO BE MET
        //set timeout(wait(param1, param2), 100); // causes stack error ;-)
        setTimeout(wait, 100, param1, param2) // works
      } else {
        // CODE to launch until condition is met
        if (printOutput != "") {
          res.end(html5_frag1+printOutput+html5_frag2);
        }
        else {
          res.end(html5_frag1+"Dim canlyniadau / No results"+html5_frag2);
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
  var parts = date.split(" ").map(function(item) {
    return item.trim();
  });
  var d = parts[2]+'-'+(months.indexOf(parts[1])+1).toString().padStart(2, '0')+'-'+parts[0].padStart(2, '0')+'T00:00:00.000Z';
  //return (d.getTime());
  return new Date(d).getTime();
}

function outputArray(array, order) { // 0 = forward (desc), 1 = reverse (asc)

  //sort by timestamp
  // use slice() to copy the array and not just make a reference
  console.log(array);
  var byDate = array.slice(0); // copies whole array from 0 to end
  //console.log(byDate);
  byDate.sort(function(a,b) {
    return a.timestamp - b.timestamp;
  });
  if (order == 1) { byDate.reverse(); }
  byDate.forEach(function(n) { console.log(n['timestamp']) });  // prints each 'html' field from array to console
  var localPrintOutput = "";
  byDate.map(function(n) { localPrintOutput += n['html'] });  // prints each 'html' field from array to variable
  
  console.log("\""+localPrintOutput+"\"");
  return localPrintOutput; // return value to be included in the server response, which is waiting for it
}

function returnHTMLArray(request_data) {

  arrayOfObjects = [];
  const $ = cheerio.load(request_data);

  // OLD SECTION - ONLY CC
  // Find all div elements with a class of "example" using the class selector
  //const item = $("div.col-xs-12.result"); // returns search items
  //const item = $('[class="col-xs-12 result"]'); // should be equivalent to the above
  //const date = $("div.col-xs-12.result div.col-xs-2:eq(1)"); // returns just dates of search items

  // NEW SECTION - CC & PN
  // Find all div elements with a class of "example" using the class selector
  const item = $(".result"); // returns search items
  //const item = $('[class="result"]'); // should be equivalent to the above
  const date = $(".result div.col-xs-2:eq(1), li.col-sm-2:eq(0)"); // returns just dates of search items

  // OLD SECTION - ONLY CC
  // Add appropriate path to result link (CC)
  //attr_val = $( "div.col-xs-12.result > h2 > a" ).attr('href');
  //$( "div.col-xs-12.result > h2 > a" ).attr('href', sourceURL+attr_val);
  // Add appropriate path to source link
  //attr_val = $( "div.col-xs-5 > a" ).attr('href');
  //$( "div.col-xs-5 > a" ).attr('href', sourceURL+attr_val);

  // NEW SECTION - CC & PN
  // Add appropriate path to result link (CC && PN)
  attr_val = $( ".result > h2 > a" ).attr('href');
  $( ".result a" ).attr('href', sourceURL+attr_val);
  // Add appropriate path to source link
  //attr_val = $( "div.col-xs-5 > a" ).attr('href');
  //$( "div.col-xs-5 > a" ).attr('href', sourceURL+attr_val);

  // Iterate over each div element to get the search item
  item.each((i, item) => {
    if (item) {
      // Iterate over each div element to get the date
      // Put the result into an array

      // Be careful to add it to the array correctly like this, or else it won't be parsed properly
      arrayOfObjects = [{'html': $(item).html(), 'timestamp': timestamp($(date).html()), 'date': $(date).html()}];
      //arrayOfObjects = []; // NOT HERE!!
    }
  });
  return arrayOfObjects;
}

async function serverRequest (val, callback) {

  // CRUCIAL DELAY TO PREVENT HITTING SERVER TOO HARD
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), delay_in_ms)
  });
  let result = await promise; // wait until the promise resolves (*)
  console.log(result); // 1 TESTING

  var arrayOfMultipleObjects = [];

  // MAKES A REQUEST TO THE WEB SERVICE FOR EACH REQUEST
  https.get(sourceURL+'search?query='+val, (resp) => {

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
    printOutput = outputArray(finalArrayOfObjects, 0); // 0 = forward (desc), 1 = reverse (asc)
    counter = 0; trigger = true;
  }
  // results are returned via printOutput
}

function createMultipleRequests(pattern) {

  // CREATES ARRAY OF REQUESTS
  requests = pattern.generate();
  numOfRequests = requests.length; // SET COUNTER LENGTH
  for(const val of requests) {
    // ITERATES ARRAY OF REQUESTS
    //console.log(val); // outputs search terms from the regex to console iteratively (TESTING)

    //combinedArrayOfMultipleObjects += serverRequest(val); // SEND REQUEST TO SERVER

    serverRequest(val, function(results){
      handleResults(results);
    });
  }
  //numOfRequests = 0; // NOT REQUIRED
  //combinedArrayOfMultipleObjects = []; // NOT HERE
}