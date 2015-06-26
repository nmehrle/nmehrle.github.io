var bars = ["#work","#school","#play"];
var openStates = [false,false,false];
var height = 135;
var headHeight=330;
var headTop=15;
var expHeight = 465;
var tops = [0,height,2*height];
animationTime=200;
var base = true;


$(document).ready(function() {
	$("#header").height(headHeight+"px").css("top",headTop+"px");
	$("#bars").height(3*height+"px");
	$("#barsCont").height(3*height+"px").css("top",headTop+headHeight+"px");


	$.each(bars, function(i,val) {
		$(val).height(height+"px");
		//hover expand
		$(val).hover(function() {
			if(!anyOpen(openStates)) {
				expand(val);
			}
		},function() {
			if(!anyOpen(openStates))  {
				collapse(val);
			}
		});
		
		//click open
		$(val).click(function() {
			if(openStates[i]){
				closeBar(val,i);
				openStates[i]=false;
				$("#barsCont").height(3*height+"px");
			}
			else if(anyOpen(openStates)) {
				openBar(val,i);
				$.each(openStates, function(j,state) {
					if(state) {
						closeBar(bars[j],j);	
						openStates[j]=false;
					}
				});
				openStates[i]=true;
			}
			else {
				$("#barsCont").height(3*height+expHeight+"px");
				openBar(val,i);
				openStates[i]=true;
			}
		});
		
	});

	$("#about").click (function() {
		if(base) {
			base=false;
			$("#bars").stop().velocity({top:3*height+expHeight+2+"px"},600,function() {
				if(!base) $("#barsCont").css("display","none");
			});
			$('#aboutWrap').css("display","block");
			$('#learn').css("display","none");
		}
		else {
			base=true;
			$("#barsCont").css("display","block");
			$("#bars").stop().velocity({top:0+"px"},600,function() {
				$("#barsCont").css("display","block");
			});
			$('#aboutWrap').css("display","none");
			$('#learn').css("display","block");
		}
	});

	$("#aboutReturn").click( function() {
		base=true;
		$("#barsCont").css("display","block");
		$("#bars").stop().velocity({top:0+"px"});
		$('#aboutWrap').css("display","none");
		$('#learn').css("display","block");		
	});
});

function anyOpen(states) {
	for (var i = states.length - 1; i >= 0; i--) {
		if(states[i]){
			return true;
		}
	};
	return false;
};

function expand(bar) {
	$(bar).velocity({width:"104%"},{duration:animationTime,queue:false});
	$(bar).velocity({left:"-2%"},{duration:animationTime,queue:false});
}

function collapse(bar) {
	$(bar).velocity({width:"100%"},{duration:animationTime,queue:false});
	$(bar).velocity({left:"0"},{duration:animationTime,queue:false});
}

function openBar(bar,i) {
	$(bar).velocity({height:height+expHeight+"px"},{duration:0,queue:false});
	expand(bar);
	$('html, body').animate({
        scrollTop: height*i+headHeight+"px"
    }, 300);
	if(i==0) {
		$("#workText").css("display","none");
		$(".subWork").css("display","block");
	}
};

function closeBar(bar,i) {
	$(bar).velocity({height:height+"px"},{duration:0,queue:false});
	collapse(bar);
	if(i==0) {
		$("#workText").css("display","block");
		$(".subWork").css("display","none");
	}
};






