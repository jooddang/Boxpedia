var map;
var neighborhoods = [];
var markers = [];
var iterator = 0;



function initialize() {
	var mapOptions = {
		  center: new google.maps.LatLng(0, 0),
		  zoom: 2,
		  mapTypeId: google.maps.MapTypeId.ROADMAP,
		  region: "en"
		};

	map = new google.maps.Map(document.getElementById("map-canvas"),
		    mapOptions);	
	var geocoder = new google.maps.Geocoder();

	var File = Parse.Object.extend("File");
	var ll_query = new Parse.Query(File);
	ll_query.exists('latitude');
	ll_query.limit(1000);
	ll_query.notEqualTo('latitude', null);
	ll_query.find().then(function(files) {
		console.log('==========', files.length);
		for (var i = 0; i < files.length; i++) {
			// console.log('=======' + files[i].get('latitude').value + ',' + files[i].get('longitude').value);
			var latlng = new google.maps.LatLng(files[i].get('latitude'), files[i].get('longitude'));
			neighborhoods.push(latlng);
			// console.log('nei' + latlng);
			// var marker = new google.maps.Marker({
			// 		    position: latlng,
			// 		    map: map,
			// 		    title:'geo fuck'
			// 		});
			geocoder.geocode({'latLng': latlng}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var locality = '';
					console.log(results);
					for (var k = 0; k < results.length; k++) {
						var comp = results[k].address_components;
						for (var j = 0; j < comp.length; j++) {
							var locality_index = $.inArray('locality', comp[j]['types']);
							if (locality_index !== -1) {
								locality = comp[j]['long_name'];
								break;
							}
						}
						if (locality !== '') {
							// if locality is found, don't search for subsequent elements of array
							break;
						}
					}
					var marker = new google.maps.Marker({
					    position: results[0].geometry.location,
					    map: map,
					    title:locality
					});
					var file_query = new Parse.Query(File);
					var llat = results[0].geometry.location.nb;
					var llat_upper = Math.ceil(llat * 10) / 10;
					var llat_lower = Math.floor(llat * 10) / 10;
					var llong = results[0].geometry.location.ob;
					var llong_upper = Math.ceil(llong * 10) / 10;
					var llong_lower = Math.floor(llong * 10) / 10;
					file_query.greaterThanOrEqualTo('latitude', llat_lower);
					file_query.lessThanOrEqualTo('latitude', llat_upper);
					file_query.greaterThanOrEqualTo('longitude', llong_lower);
					file_query.lessThanOrEqualTo('longitude', llong_upper);
					file_query.find().then(function(filess){
						for (var i = 0; i < filess.length; i++) {
							filess[i].set('locality', locality);
							filess[i].save();	
						}
					});
				} else {
					console.log("Geocode was not successful for the following reason: " + status);
				}
			});	
		}
	}).then(function() {
		for (var i = 0; i < neighborhoods.length; i++) {
		    setTimeout(function() {
		      markers.push(new google.maps.Marker({
		    position: neighborhoods[iterator],
		    map: map,
		    draggable: false,
		    animation: google.maps.Animation.DROP,
		    title: 'geo.....'
		  }));
		  iterator++;
		  // console.log('=====', markers);
		    }, i * 200);
		  	}	
	});

	
};


google.maps.event.addDomListener(window, 'load', initialize);