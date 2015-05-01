var on = false;

$(document).ready(function() {
	var bars = ["#work","#school","#play"];
	var height = 135;
	var headHeight=300;
	var tops = [headHeight,headHeight+height,headHeight+2*height];
	animationTime=200;

	$("#header").height(headHeight+"px");

	$.each(bars, function(i,val) {
		$(val).height(height+"px");
		$(val).css("top",tops[i]+15+"px");
		$(val).hover(function() {
			$(val).velocity({width:"104%"},{duration:animationTime,queue:false});
			$(val).velocity({left:"-2%"},{duration:animationTime,queue:false});
		},function() {
			$(val).velocity({width:"100%"},{duration:animationTime,queue:false});
			$(val).velocity({left:"0"},{duration:animationTime,queue:false});
		});
	});
});