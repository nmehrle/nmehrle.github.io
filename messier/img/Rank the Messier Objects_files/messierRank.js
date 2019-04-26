$(document).ready(function(){
  chooseObjects();
});

function chooseObjects() {
  nObj = 110;
  ind1 = getRandomInt(1, nObj);
  ind2 = getRandomInt(1, nObj);

  while(ind1 == ind2) {
    ind2 = getRandomInt(1, nObj);
  }
  
  str1 = 'img/M'+ind1+'.jpg'
  str2 = 'img/M'+ind2+'.jpg'

  // $(".obj_1 .messier_image").attr('src',str1)
  // $(".obj_2 .messier_image").attr('src',str2)
}

// $(".obj_1").onClick(function() {
//   chooseObjects()
// })

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}