const init = {name: "src", value: "all"};
window.onload = function() { changeSourceRadioButton(init); }
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
}

function validateForm() {
	var valid = true; // default
	$(".info").html(""); // removes error content by input box(es)
	$(".input-field").css('border', '#e0dfdf 1px solid'); // grey
	$("#query").removeClass("error-field"); // removes error css class by input box(es)
	$("#statusMessage").html(""); // removes status message below submit box
	
	var query = $("#query").val();
	
	if (query == "") {
		$("#query-info").html("Gofynnol");
		$("#query").css('border', '#e66262 1px solid');
		$("#query").addClass("error-field");
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
