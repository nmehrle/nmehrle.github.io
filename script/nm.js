var headerValues = {
  ".header": {
    "padding": {
      start: 50,
      end: 5
    },

    "width": {
      start: 0,
      end: 150 
    },

    "font-size": {
      start: 48,
      end: 30
    }
  },
  ".hdr-subtitle": {
    "font-size": {
      start:35,
      end:18
    }
  },
  ".hdr-title": {
    "margin-top":{
      start: 15,
      end: -5
    }
  },
  ".hdr-intro-inner > hr": {
    "width": {
      start: 380,
      end: 130
    },
    "height": {
      start: 3,
      end: 2
    }
  },
  ".hdr-btn": {
    "width": {
      start: 100,
      end: 85
    },
    "height": {
      start: 40,
      end: 30
    },
    "font-size": {
      start: 18,
      end:14
    }
  },
  ".scroll-btn": {
    "opacity": {
      start: 1,
      end: -5
    }
  }
};
var headerScale = 2.5;

$(document).ready(function(){
  initialize();
});

$('.scroll-btn').click(function() {
  let dest = $(window).height()/headerScale+40;
  $('html,body').animate({scrollTop: dest}, {duration: 600});

});

function initialize() {
  headerValues['.header']['width']['start'] = $(window).width()+3;
  headerTransition();
  $(window).scroll();
}
;
window.onresize = function(event) {
  initialize();
}

function headerTransition() {
  var $w = $(window);
  let winHeight = $w.height();
  $w.scroll(function() {
    let winTop = $w.scrollTop();
    let percent = 1 - (winTop/winHeight)*headerScale;
    if(percent<=0) {
      percent = 0;
    }
    else if (percent>=1) {
      percent = 1;
    }
    partialHeaderTransition(percent);
  });
};

function partialHeaderTransition(percent) {

  for (target in headerValues) {
    for (cssKey in headerValues[target]) {
      let start = headerValues[target][cssKey]['start'];
      let end   = headerValues[target][cssKey]['end'];
      let value = Math.min(start,end) + percent*Math.abs(start-end);
      
      if (cssKey == "opacity") {
        $(target).css(cssKey, value);
        if($(target).css('opacity') <=0) {
          $(target).css('display', 'none');
        }
        else {
          $(target).css('display', 'block');
        }
      }
      else {
        $(target).css(cssKey, value+'px');
      }
    }
  }
};