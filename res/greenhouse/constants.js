$(document).ready( function() {    
    var theCanvas  = document.getElementById("theCanvas");
  	var theContext = theCanvas.getContext("2d");
  	var timer;
  	var w = theCanvas.width;
  	var h = theCanvas.height;
  	var r = 5;	//particle size
  	var v = 5; //particle speed
  	var c = 10; //photon speed
  	var pr = 2; //photon size
  	var t = 1;  //timestep
  	var fps = 60; //frames per second
  	var co2Color = "black";
  	var photonColor = "red";
  	var waterColor = "blue";
  	var nspecies = 2;
});