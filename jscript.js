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
	var heights = [230,180,180,180];
	var fullHeight = 180;
	var delta = 15;

	$(".line").height(fullHeight+"px");


	for (var i = 0; i < lines.length; i++) {
		$(lines[i]).css("top",i*fullHeight+"px");
	};

	jQuery.each(lines, function(i,val) {
		if(i!=0) {
			$(val).hover(function() {
				$(lines[i-1]).animate({height:heights[i-1]-delta+"px"},{duration:200,queue:false});
				$(val).animate({height:fullHeight+2*delta+"px"},{duration:200,queue:false});
				$(val).animate({top:(fullHeight*i-delta)+"px"},{duration:200,queue:false});
				$(lines[i+1]).animate({height:fullHeight-delta+"px"},{duration:200,queue:false});
				$(lines[i+1]).animate({top:(fullHeight*(i+1)+delta)+"px"},{duration:200,queue:false});
			},function() {
				$(lines[i-1]).animate({height:heights[i-1]+"px"},{duration:200,queue:false});
				$(val).animate({height:fullHeight+"px"},{duration:200,queue:false});
				$(val).animate({top:(fullHeight*i)+"px"},{duration:200,queue:false});
				$(lines[i+1]).animate({height:fullHeight+"px"},{duration:200,queue:false});
				$(lines[i+1]).animate({top:(fullHeight*(i+1))+"px"},{duration:200,queue:false});
			});
		}
	});
});