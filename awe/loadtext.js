$(document).ready(function() {
	var language = "en";

	loadLanguages();
});

function loadLanguages() {
	$.getJSON(getJSONName(), function(data) {
		var default_lang = data['languages']['default'];
		var default_lang_code = Object.keys(default_lang)[0];

		//set lang-button
		$('.active-language').text(default_lang[default_lang_code]);
		$('.active-language').attr('id', default_lang_code);


		//load all text: 
		interpretJSON(data, default_lang_code);
		 

		$.each(data['languages']['additional'], function(key,value) {
			$('.additional-languages').append("<li><a id='"+key+"' class='lang-btn'>"+value+"</a></li>");
		});
	});
}

function getJSONName() {
	var filename = location.pathname.split('/').pop();
 	var extIndex = filename.indexOf(".html");
 	if (extIndex != -1) {
 	  filename = filename.substr(0,extIndex);
 	}
	return filename+'.json';
}

function interpretJSON(data,language) {
	data = data[language];

	$.each(data, function(key,value) {
		if(Array.isArray(value)) {
			var children = $('#'+key).children();
			for (var i = 0; i < value.length; i++) {
				$(children[i]).empty().append(value[i]);
			}
		}
		else {
			$("#"+key).text(value);
		}
	});
}

function reloadJSON(language) {
	$.getJSON(getJSONName(), function(data) {
		interpretJSON(data,language);
	});
};

$(document).on('click', '.lang-btn', function() {
	var activeHTML = $('.active-language');
	var old_active = [activeHTML.attr('id'), activeHTML.text()];

	activeHTML.text(this.text);
	activeHTML.attr('id', this.id);

	reloadJSON(this.id);

	this.text = old_active[1];
	this.id   = old_active[0];
});