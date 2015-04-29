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
	var subHeight = 135;
	var mainHeight = 300;
	var overlap =20;
	var heights = [mainHeight,subHeight+overlap,subHeight,subHeight+overlap];
	var tops = [0,mainHeight,mainHeight+subHeight,mainHeight+2*subHeight-overlap];
	var delta = 15;
	animationTime=200;

	$('.textSpace').height(overlap+"px");

	$.each(lines, function(i,val) {
		$(val).height(heights[i]+"px");
		$(val).css("top",tops[i]+"px");
		if(i!=0) {
			$(val).hover(function() {
				$(lines[i-1]).animate({height:heights[i-1]-delta+"px"},{duration:animationTime,queue:false});
				$(val).animate({height:heights[i]+2*delta+"px"},{duration:animationTime,queue:false});
				$(val).animate({top:(tops[i]-delta)+"px"},{duration:animationTime,queue:false});
				if(i!=3) {
					$(lines[i+1]).animate({height:heights[i+1]-delta+"px"},{duration:animationTime,queue:false});
					$(lines[i+1]).animate({top:(tops[i+1]+delta)+"px"},{duration:animationTime,queue:false});
				}
			},function() {
				$(lines[i-1]).animate({height:heights[i-1]+"px"},{duration:animationTime,queue:false});
				$(val).animate({height:heights[i]+"px"},{duration:animationTime,queue:false});
				$(val).animate({top:tops[i]+"px"},{duration:animationTime,queue:false});
				if(i!=3) {
					$(lines[i+1]).animate({height:heights[i+1]+"px"},{duration:animationTime,queue:false});
					$(lines[i+1]).animate({top:tops[i+1]+"px"},{duration:animationTime,queue:false});
				}
			});
		}
	});

	$("#aboutTxt").hover(function() {
		$('#about').animate({opacity:0.8},{duration:animationTime,queue:false});
		$(this).animate({opacity:1},{duration:animationTime,queue:false});
	},function(){
		$(this).animate({opacity:0},{duration:animationTime,queue:false});
		$('#about').animate({opacity:0},{duration:animationTime,queue:false});
	});
});