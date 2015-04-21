var on = false;

$(document).ready(function() {
	$("#menuButton").click(function(){
		if(on) {
			$('#slideMenu').animate({left:"-250px"});
			$('#content').animate({left:"0px"});
			on=false;
		}
		else {
			$('#slideMenu').animate({left:"0px"});
			$('#content').animate({left:"250px"});
			on=true;
		}
	});
});