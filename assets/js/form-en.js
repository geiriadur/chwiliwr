const init = {name: "src", value: "all"};
window.onload = function() { changeSourceRadioButton(init); }
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
}

function validateForm() {
	var valid = true; // default
	$(".info").html(""); // removes error content by input box(es)
	$(".input-field").css('border', '#e0dfdf 1px solid'); // grey
	$("#query").removeClass("error-field"); // removes error css class by input box(es)
	$("#statusMessage").html(""); // removes status message below submit box
	
	var query = $("#query").val();
	
	if (query == "") {
		$("#query-info").html("Required");
		$("#query").css('border', '#e66262 1px solid');
		$("#query").addClass("error-field");
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
