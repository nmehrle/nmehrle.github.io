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

	var lines = ["#header","#work","#school","#play"];

	jQuery.each(lines, function(i,val) {
		if(i!=0) {
			$(val).hover(function() {
				$(lines[i-1]).animate({height:"175px"},{duration:200,queue:false});
				$(val).animate({height:"220px"},{duration:200,queue:false});
				$(val).animate({top:(175*i+15*(i-1))+"px"},{duration:200,queue:false});
				$(lines[i+1]).animate({height:"175px"},{duration:200,queue:false});
				$(lines[i+1]).animate({top:(190*(i+1)+15)+"px"},{duration:200,queue:false});
			},function() {
				$(lines[i-1]).animate({height:"190px"},{duration:200,queue:false});
				$(val).animate({height:"190px"},{duration:200,queue:false});
				$(val).animate({top:(190*i)+"px"},{duration:200,queue:false});
				$(lines[i+1]).animate({height:"190px"},{duration:200,queue:false});
				$(lines[i+1]).animate({top:(190*(i+1))+"px"},{duration:200,queue:false});
			});
		}
	});
});