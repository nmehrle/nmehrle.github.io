$(document).ready( function() {

	$(".menuNH").hover(function() {
		$('.menuHighlight').css("background-position","0 0");
		$('.menuHighlight').css("color", "#fff");
	},function(){
		$('.menuHighlight').css("background-position","0 202%");
		$('.menuHighlight').css("color", "#111");
	});

});

