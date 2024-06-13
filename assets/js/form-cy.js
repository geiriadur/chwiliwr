var init = {name: "src", value: "all"};
window.onload = function() {
	/*changeSourceRadioButton(init);
	searchableBox("decade-search","decade\\[\\]", false);
	searchableBox("year-search","year\\[\\]", false);
	searchableBox("month-search","month\\[\\]", false);
	searchableBox("day-search","day\\[\\]", false);
	searchableBox("pub-search","publication\\[\\]", true);*/
	
	var inputNumFields = document.querySelectorAll('.numbers-only');
	var inputTextOnlyFields = document.querySelectorAll('.text-only');

	// For decades, years and days allow only numerals
	inputNumFields.forEach((inputNumField) => {
		inputNumField.onkeydown = function(event) {
			// Only allow if the e.key value is a number or if it's 'Backspace'
			if(isNaN(event.key) && event.key !== 'Backspace') {
				event.preventDefault();
			}
		};
	});
	
	// For months allow only letters not numerals
	inputTextOnlyFields.forEach((inputTextOnlyField) => {
		inputTextOnlyField.onkeydown = function(event) {
			// Only allow if the e.key value is a letter a-z or A-Z or if it's 'Backspace'
			if (event.keyCode >= 65 && event.keyCode <= 90) {
				// Alphabet upper case is fine
			} else if (event.keyCode >= 97 && event.keyCode <= 122) {
				// Alphabet lower case is fine
			} else if (event.key == 'Backspace') {
				// Backspace is fine
			} else {
				event.preventDefault();
			}
		};
	});
	
	// sadly this doesn't allow duplicate keys - latter overwrites former
	const searchParams = new URLSearchParams(window.location.search);
	var getData = unserialize(searchParams);
	//alert(JSON.stringify(getData));
	
	//getData = Object.fromEntries(new URLSearchParams(location.search)); // does the same as the above without the function, with same restriction
	//alert(JSON.stringify(getData));
	//alert(typeof getData);
	
	var src_value;
	
	function loadFormElements(form, data ) {
		//alert("here");
		//alert(JSON.stringify(data));
		//$.each(data, function(name, value) {
			//alert(name);
			//alert(value);
		// extract values from object from array to allow duplicate keys
		$.each(data, function(key, obj) {
			//alert(JSON.stringify(obj));
			var name;
			var value;
			Object.values(obj).forEach((content, index) => {
				const key = Object.keys(obj)[index];
				name = key; value = content;
				//alert(name);
				//alert(value);
			});
/*			
			for (let [key, value] of obj) { // get pair > extract it to key/value
				// following lines produces an array containing objects
				name = key;
				value = value;
			}
			
*/					
			if (name.includes("[") || name.includes("[")) {
				// Changes any keys containing the characters [ and ] to \\[ and \\] so that javascript processes them correctly
				//name = name.replace(/\[/g, "\\[");
				//name = name.replace(/\]/g, "\\]");
				name = name.replace(/([\[\]])/g, "\\$1"); // combines above lines
			}
			//console.log("--"+$("option[value='" + value + "']").attr("id"));
			//console.log("name: "+name);
			//console.log("value: "+value);
			//console.log($("input[id='" + name + "']").length);
			//if ($("input[id='" + name + "']").attr("id")) {console.log("id=name: "+$("input[id='" + name + "']").attr("id"));}
			//if ($("input[id='" + value + "']").attr("name")) {console.log("id=value: "+$("input[id='" + value + "']").attr("name"));}
			//if ($("option[value='" + value + "']").attr("id")) {console.log( "option: " + $("option[value='" + value + "']").parent().attr("id") );}
			if ($("input[id='" + name + "']").length) {
				// input id=name exists
				//alert("input id=name");
				//console.log(name+" :: "+value);
				var element = $(form).find("input[id='" + name + "']");
				//if( $(element).is(":text")) {
				if ($(element).attr('type') == "text") { // does the same but supports more type values
					//$("input[id='" + name + "']").val(value); // no need to check value of element again, so see next line
					$(element).val(value);
				}
				//else if( $(element).is(":checkbox")) {
				else if ($(element).attr('type') == "checkbox") { // does the same but supports more type values
					//console.log("name: "+name+"; value: "+value+"; value type: "+typeof value);
					//console.log($(element).val());
					//console.log(typeof $(element).val());
					//console.log($(element).val() === value);
					//$("input[id='" + name + "']").prop("checked", true); // no need to check value of element again, so see next line
					//$(element).prop("checked", true); // might be false for checkbox, so see next line
					$(element).prop('checked', $(element).val() === value ); // also evaluates if element value and type is same as that in the query
					$(element).val(value); // also set value
					//if (value == "true") { $(element).prop("checked", true); $(element).val(value); }
					//else if (value == "false") { $(element).prop("checked", false); $(element).val(value); }
				}
				
				//if( $(element).is(":radio")) { // does the same but supports more type values
				else if ($(element).attr('type') == "radio") {
					//$("input[id='" + name + "']").prop("checked", true); // no need to check value of element again, so see next line
					//$(element).prop("checked", true);
					$(element).prop('checked', $(element).val() === value ); // also evaluates if element value and type is same as that in the query
				}
				
				//if( $(element).is(":hidden")) {
				else if ($(element).attr('type') == "hidden") { // does the same but supports more type values
					// DO NOTHING TO AVOID A CRASH: OTHERWISE WRITING THIS BELOW APPEARS TO BLANK THE VALUE
				}
				//if( $(element).is(":number")) { // Doesn't work because the pseudo-selector :number doesn't exist
				else if ($(element).attr('type') == "number") {
				//console.log("here");
				//console.log("--"+$("option[value='" + value + "']").attr("id"));
				//console.log("name: "+name);
				//console.log("value: "+value);
				//console.log($("input[id='" + name + "']").length);
					//$("input[id='" + name + "']").val(value); // no need to check value of element again, so see next line
					var num = parseInt(value);
					if (!isNaN(num)) {
						$(element).val(num); //console.log("GOT HERE");
					}
				}
				else {
					//$("input[id='" + name + "']").val(value); // no need to check value of element again, so see next line
					$(element).val(value);
				}
			}
			else if ($("input[id='" + value + "']").length) {
				// input id=value exists
				//alert("input id=value");
				var element = $(form).find("input[id='" + value + "']");
				/* if( $(element).is(":hidden") || (element).is(":number")) { // It isn't going to be text, at least - no number selector in jquery
					//$("input[id='" + value + "']").val(value);
					$(element).val(value);
				} */
				if( $(element).is(":checkbox") || (element).is(":radio")) {
					//$("input[id='" + value + "']").prop("checked", true);
					//$(element).prop("checked", true); // might be false for checkbox, so see next line
					$(element).prop('checked', $(element).val() === value );
					//if (value == "true") { $(element).prop("checked", true); }
					//else if (value == "false") { $(element).prop("checked", false); }
				}
				else if( $(element).is(":hidden")) {
					// DO NOTHING TO AVOID A CRASH: OTHERWISE WRITING THIS BELOW APPEARS TO BLANK THE VALUE
				}
				//if( $(element).is(":number")) { // Doesn't work because the pseudo-selector :number doesn't exist
				else if ($(element).attr('type') == "number") {
				//console.log("there");
					//$("input[id='" + name + "']").val(value); // no need to check value of element again, so see next line
					var num = parseInt(value);
					//console.log(num);
					if (isNan(num)) {
						$(element).val(num);
					}
				}
				else {
					//$("input[id='" + value + "']").val(value);
					$(element).val(value);
				}
			}
			//else if ($("option[value='" + value + "']").length) {
			else if ($("select[id='" + name + "'] > option[value='" + value + "']").length) { // prevent conflicts - TEST
				console.log("select[id='" + name + "'] > option[value='" + value + "']");
				var element = $(form).find("select[id='" + name + "'] > option[value='" + value + "']");
				//var element = $(form).find("option[value='" + value + "']");
				//console.log( "option-: " + $("option[value='" + value + "']").parent().attr("id") );
				//else if ($("select[name='" + name + "'] > option[value='").length) {
				// option value=value exists
				//alert("option");
				
				//element = $(form).find("select[name='" + name + "'] > option[value='" + value + "']");
				//$("option[id='" + value + "']").prop("selected", function () {
				$(element).prop("selected", function () {
					return ~$.inArray(this.text, [value]);
				});
			}
			/* else {
				// The element does not exist
			} */
			
			if (name == "src") { src_value = value; } // for changeSourceRadioButton(init) below
		});
	}
	
	loadFormElements( $("#formSearch"),getData);	
	init = {name: "src", value: src_value};
	changeSourceRadioButton(init);
	searchableBox("decade-search","decade\\[\\]", false);
	searchableBox("year-search","year\\[\\]", false);
	searchableBox("month-search","month\\[\\]", false);
	searchableBox("day-search","day\\[\\]", false);
	searchableBox("pub-search","publication\\[\\]", true);
}
//alert( init.name+"=\""+init.value+"\"" ); // TESTING

function changeSearchRadioButton(el){
	//if (el.value == 'score'){
	//document.getElementById("search").innerHTML = "Ceir canlyniadau mewn adrannau yn ôl pob amrywiad.";
	//}else{
	//document.getElementById("search").innerHTML = "Ceir canlyniadau yn ôl dyddiad.";
	//} 
}
function changeSourceRadioButton(el){
    if (el.value == 'all'){
        //alert( el.name+"=\""+el.value+"\"" ); // TESTING
        document.getElementById("complexity").innerHTML = "Y nifer fwyaf o amrywiadau a ganiateir yn y mynegiad rheolaidd yw 60 * 2 = 120.";
		document.getElementById("search").innerHTML = "fesul amrywiad: CN, PNCA";
		}else{
        document.getElementById("complexity").innerHTML = "Y nifer fwyaf o amrywiadau a ganiateir yn y mynegiad rheolaidd yw 120.";
		document.getElementById("search").innerHTML = "fesul amrywiad";
	}
	if (el.value == 'all'){
		$("[id^='CC']:selected").prop("selected", false); $("[id^='PN']:selected").prop("selected", false); /* unselects all publications */
		
		/* unselect all of the below */
		$("#publication\\[\\] option").prop("selected", false);
		$("#category\\[\\] option").prop("selected", false);
		$("#region\\[\\] option").prop("selected", false);
		$("#illustration\\[\\] option").prop("selected", false);
		$("#rights\\[\\] option").prop("selected", false);
		
		$('.cc_and_pn').css("display", "none"); /* hide the publications box */
		$('.pn').css("display", "none"); /* hide the other boxes */
	}
	else if (el.value == 'cc') {
		$("[id^='PN']").prop("selected", false); // unselects all PN
		
		/* unselect all of the below */
		$("#category\\[\\] option").prop("selected", false);
		$("#region\\[\\] option").prop("selected", false);
		$("#illustration\\[\\] option").prop("selected", false);
		$("#rights\\[\\] option").prop("selected", false);
		
		$('.cc_and_pn').css("display", "block"); /* show the publications box */
		$('.pn').css("display", "none"); /* hide the other boxes */
		
		$("[id^='CC']").css("display", "block"); $("[id^='PN']").css("display", "none"); /* shows only CC */
	}
	else if (el.value == 'pn') {
	    $("[id^='CC']").prop("selected", false);  // unselects all CC
		
		$('.cc_and_pn').css("display", "block"); /* show the publications box */
		$('.pn').css("display", "block"); /* show the other boxes */
		
		$("[id^='PN']").css("display", "block"); $("[id^='CC']").css("display", "none"); /* shows only PN */
	}
}

function validateForm() {
	var valid = true; // default
	$(".info").html(""); // removes error content by input box(es)
	$(".input-field").css('border', '#e0dfdf 1px solid'); // grey
	$("#query").removeClass("error-field"); // removes error css class on input box(es)
	$("#range\\[min\\]").removeClass("error-field"); // removes error css class on input box
	$("#range\\[max\\]").removeClass("error-field"); // removes error css class on input box
	$("#statusMessage").html(""); // removes status message below submit box
	
	var query = $("#query").val();
	var range_min = Number($("#range\\[min\\]").val());
	var range_max = Number($("#range\\[max\\]").val());
	
	if (query == "") {
		$("#query-info").html("Gofynnol");
		$("#query").css('border', '#e66262 1px solid');
		$("#query").addClass("error-field");
		valid = false;
	}
	if (range_min < 1735 || range_min > 2007) {
		$("#years-info").html("1735-2007");
		$("#range\\[min\\]").css('border', '#e66262 1px solid');
		$("#range\\[min\\]").addClass("error-field");
		valid = false;
	}
	if (range_max < 1735 || range_max > 2007) {
		$("#years-info").html("1735-2007");
		$("#range\\[max\\]").css('border', '#e66262 1px solid');
		$("#range\\[max\\]").addClass("error-field");
		valid = false;
	}
	if (valid == false) {
		$('.error-field').first().focus();
		$("#statusMessage").html("Ni all chwiliad fod yn wag.");
		//$("#statusMessage").css('color', 'red !important'); /* !important doesn't work */
		$('#statusMessage').attr('style', 'color: red !important');
	}
	if (valid == true) {
		$("#statusMessage").html("Arhoswch funud ar &ocirc;l cyflwyno: gall chwiliadau cymhleth neu fawr gymryd ychydig o amser!");
		//$("#statusMessage").css('color', 'orange !important'); /* !important doesn't work */
		$('#statusMessage').attr('style', 'color: orange !important');
	}
	return valid;
}

/* $(document).ready(function () { // example of box that appears if required - unused
	$(".box-option").click(function () {
	if($(this).val() == "others") {
	$("#other-box").show();
	} else {
	$("#other-box").hide();
	}
	});
}); */

function searchableBox(searchBox, elements, bool) {
	searchBox = document.querySelector("#"+searchBox);
	elements = document.querySelector("#"+elements);
	var when = "keyup"; //You can change this to keydown, keypress or change
	
	if (searchBox) { searchBox.addEventListener("keyup", function (e) {
		var text = e.target.value; //searchBox value
		var options = elements.options; //select options
		for (var i = 0; i < options.length; i++) {
			var option = options[i]; //current option
			var optionText = option.text; //option text ("Somalia")
			var lowerOptionText = optionText.toLowerCase(); //option text lowercased for case insensitive testing
			var lowerText = text.toLowerCase(); //searchBox value lowercased for case insensitive testing
			var regex = new RegExp("^" + text, "i"); //regExp, explained in post
			var match = optionText.match(regex); //test if regExp is true
			var contains = lowerOptionText.indexOf(lowerText) != -1; //test if searchBox value is contained by the option text
			//if (match || (contains && isNaN(text))) { //if one or the other goes through, assuming that the latter is not a number
			if (match || (contains && bool)) { //if one or the other goes through, assuming that the latter is not disabled (numbers and months)
				//option.selected = true; //select that option
				option.style.display = "block";
				//console.log("--SHOW--"+option.textContent); // TESTING
				//return; //prevent other code inside this event from executing
			}
			else {
			    option.selected = false; //deselect that option
				option.style.display = "none";
				//console.log("--HIDE--"+option.textContent); // TESTING
			}
			if (text == optionText) { //if it matches
				option.selected = true; //select that option
				//option.style.display = "block";
				//console.log("--SHOW--"+option.textContent); // TESTING
				//return; //prevent other code inside this event from executing
			}
			else { option.selected = false; } //deselect that option
			//searchBox.selectedIndex = 0; //if nothing matches it selects the default option
		}
	}); }
}

function unserialize(serializedData) {
    let urlParams = new URLSearchParams(serializedData); // get interface / iterator
    let unserializedData = []; // prepare result object
    for (let [key, value] of urlParams) { // get pair > extract it to key/value
        //unserializedData[key] = value; // array did not allow duplicate keys
		// following lines produces an array containing objects
		var obj = {};
		obj[key] = value;
		unserializedData.push(obj);
		//alert(JSON.stringify(unserializedData));
	}
	
    return unserializedData;
}

function switchForms(interface, advanced) {
	var queryString = $('#formSearch').serialize();
	// need to add regex=false in order to pass unselected value
	if (!queryString.includes("regex=")) {
			queryString += "&regex=false";
	}
	//alert(interface);
	if (interface) {
		/* if (queryString.includes("interface=")) {
		//alert("replace");
		queryString = queryString.replace(/interface=../g, "interface="+interface); */
		if (queryString.includes("interface=cy")) {
			//alert("replace");
			queryString = queryString.replace(/interface=cy/g, "interface="+interface);
		}
		else if (queryString.includes("interface=en")) {
			//alert("replace");
			queryString = queryString.replace(/interface=en/g, "interface="+interface);
		} else {
			//alert("add");
			queryString += "&interface="+interface;
		}
		//alert(queryString);
	}
	if (advanced) {
		if (queryString.includes("advanced=true")) {
			//alert("replace");
			queryString = queryString.replace(/advanced=true/g, "advanced="+advanced);
		}
		else if (queryString.includes("advanced=false")) {
			//alert("replace");
			queryString = queryString.replace(/advanced=false/g, "advanced="+advanced);
		} else {
			//alert("add");
			queryString += "&advanced="+advanced;
		}
		//alert(queryString);
	}
	//window.location='?advanced=false&interface=cy'+'&'+queryString;
	//window.location='?'+queryString+'&advanced=false';
	window.location='?'+queryString;
}