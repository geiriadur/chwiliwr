const init = {name: "src", value: "all"};
window.onload = function() {
	changeSourceRadioButton(init);
	searchableBox("decade-search","decade\\[\\]", false);
	searchableBox("year-search","year\\[\\]", false);
	searchableBox("month-search","month\\[\\]", false);
	searchableBox("day-search","day\\[\\]", false);
	searchableBox("pub-search","publication\\[\\]", true);
	
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
	
	function loadFormElements(form, data ) {
		//alert("here");
		//alert(JSON.stringify(data));
		$.each(data, function(name, value) {
			//alert(name);
			//alert(value);
					
			if ($("input[id='" + name + "']").length) {
				// input id=name exists
				//alert("input id=name");
				var element = $(form).find("input[id='" + name + "']");
				/*if( $(element).is(":text") || (element).is(":hidden") || (element).is(":number")) { // No number selector in jquery
					$("input[id='" + name + "']").val(value);
					//(element).val(value);
				} */
				if( $(element).is(":checkbox") || (element).is(":radio")) {
					//$("input[id='" + name + "']").prop("checked", true);
					//$(element).prop("checked", true); // might be false for checkbox, so see next line
					$(element).prop('checked', $(element).val() === value );
				}
				else {
					//$("input[id='" + name + "']").val(value);
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
					$(element).prop("checked", true);
				}
				else {
					//$("input[id='" + value + "']").val(value);
					$(element).val(value);
				}
			}
			else if ($("option[value='" + value + "']").length) {
				// option value=value exists
				//alert("option");
				element = $(form).find("option[id='" + value + "']");
				//$("option[id='" + value + "']").prop("selected", function () {
				$(element).prop("selected", function () {
					return ~$.inArray(this.text, [value]);
				});
			}
			/* else {
				// The element does not exist
				//alert ("no element");
			} */
			
			/* if( $(element).is(":checkbox") ) {
				alert("checkbox");
				if( value == "true" ) {
					alert("checked box");
					//$(element).prop('checked', $(element).val() === "true" );
				}
				else {
					alert("unchecked box");
					//$(element).removeProp('checked' );
					//$(element).prop('checked', $(element).val() === "false" );
				}
			}
			else {
				alert("not checkbox");
				//if (document.querySelector(element)) { alert("value set"); element.val(value); }
			} */
		});
	}
	loadFormElements( $("#formSearch"),getData);	
}
//alert( init.name+"=\""+init.value+"\"" ); // TESTING

function changeSearchRadioButton(el){
	//if (el.value == 'score'){
	//document.getElementById("search").innerHTML = "Results in sections by variation.";
	//}else{
	//document.getElementById("search").innerHTML = "Results by date.";
	//} 
}
function changeSourceRadioButton(el){
    if (el.value == 'all'){
        //alert( el.name+"=\""+el.value+"\"" ); // TESTING
		document.getElementById("complexity").innerHTML = "The largest number of variations allowed in the regular expression is 60 * 2 = 120.";
		document.getElementById("search").innerHTML = "by variation: WJ, WNO";
		}else{
		document.getElementById("complexity").innerHTML = "The largest number of variations allowed in the regular expression is 120.";
		document.getElementById("search").innerHTML = "by variation";
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
		$("#query-info").html("Required");
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
		$("#statusMessage").html("Search cannot be empty.");
		//$("#statusMessage").css('color', 'red !important'); /* !important doesn't work */
		$('#statusMessage').attr('style', 'color: red !important');
	}
	if (valid == true) {
		$("#statusMessage").html("Wait a moment after submitting: complex or large searches can take time!");
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
    let unserializedData = {}; // prepare result object
    for (let [key, value] of urlParams) { // get pair > extract it to key/value
        unserializedData[key] = value;
	}
	
    return unserializedData;
}

function switchForms(interface, advanced) {
	var queryString = $('#formSearch').serialize();
	//alert(interface);
	if (interface) {
		if (queryString.includes("interface=")) {
		//alert("replace");
			queryString = queryString.replace(/interface=../g, "interface="+interface);
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