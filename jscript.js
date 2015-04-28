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

	$("#work").hover(function() {
			$("#header").animate({height:"200px"},{duration:200,queue:false});
			$("#work").animate({height:"260px"},{duration:200,queue:false});
			$("#school").animate({height:"200px"},{duration:200,queue:false});
			$("#work").animate({top:"200px"},{duration:200,queue:false});
			$("#school").animate({top:"460px"},{duration:200,queue:false});
		},function() {
			$("#header").animate({height:"220px"},{duration:200,queue:false});
			$("#work").animate({height:"220px"},{duration:200,queue:false});
			$("#school").animate({height:"220px"},{duration:200,queue:false});
			$("#work").animate({top:"220px"},{duration:200,queue:false});
			$("#school").animate({top:"440px"},{duration:200,queue:false});
	});
});