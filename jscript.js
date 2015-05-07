var on = false;

$(document).ready(function() {
	var bars = ["#work","#school","#play"];
	var height = 135;
	var headHeight=330;
	var headTop = 15;
	var tops = [headHeight,headHeight+height,headHeight+2*height];
	animationTime=200;

	$("#header").height(headHeight+"px").css("top",headTop+"px");

	$.each(bars, function(i,val) {
		$(val).height(height+"px");
		$(val).css("top",tops[i]+headTop+"px");
		$(val).hover(function() {
			$(val).velocity({width:"104%"},{duration:animationTime,queue:false});
			$(val).velocity({left:"-2%"},{duration:animationTime,queue:false});
		},function() {
			$(val).velocity({width:"100%"},{duration:animationTime,queue:false});
			$(val).velocity({left:"0"},{duration:animationTime,queue:false});
		});
	});

	var base = true;
	$("#about").click (function() {
		if(base) {
			$.each(bars, function(i,val) {
				$(val).velocity({top:tops[i]+headTop+600+"px"});
			});
			base=false;
			$('#aboutWrap').css("display","block");
			$('#learn').css("display","none");
		}
		else {
			$.each(bars, function(i,val) {
				$(val).velocity({top:tops[i]+headTop+"px"});
			});
			base=true;
			$('#aboutWrap').css("display","none");
			$('#learn').css("display","block");


		}
	});
});