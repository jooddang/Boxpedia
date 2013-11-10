var Parse = require('parse').Parse;
Parse.initialize('GU9grS8gubm5pOLsVdWB3YRSAEflX8Aiikz6wUhP', 'PH0aqHOmXTJXSUng7856LQsfrn5kMcvdJa0aKdgt');

var $ = require('jQuery');

var User = Parse.Object.extend("myUser");
var File = Parse.Object.extend("File");



var _get_reverse_geotag = function(latlng, file_id, username) {
	$.get("http://maps.googleapis.com/maps/api/geocode/json", {
		latlng: latlng,
		sensor: "true"
	})
	.done (function(data) {
		var results = data['results'];
		if (results === undefined) {
			console.log('!!!!! google api : no results!!!! [' + data + '] file_id = ' + file_id);
		}
		console.log(data);
		var locality = '', sublocality = '';
		for (var i = 0; i < results.length; i++) {
			var comp = results[i].address_components;
			for (var j = 0; j < comp.length; j++) {
				var locality_index = $.inArray('locality', comp[j]['types']);
				var sublocality_index = $.inArray('sublocality', comp[j]['types']); 
				if (sublocality_index !== -1) {
					sublocality = comp[j]['types'][sublocality_index];
				}
				if (locality_index !== -1) {
					locality = comp[j]['types'][locality_index];
					break;
				}
			}
			if (locality !== '') {
				// if locality is found, don't search for subsequent elements of array
				break;
			}
		}
		// so, locality is found here.
		if (locality === '') {
			console.log('!!!!! google api failed.. locality is NOT found....  file_id = ' + file_id);
			return;
		}

		// query file by file_id, and update locality
		var file_query = new Parse.Query(File);
		file_query.get(file_id, {
			success: function (file) {
				file.set('locality', locality);
				if (sublocality !== '') {
					file.set('sublocality', sublocality);
				}
				file.save();

				// save localities to user object as well
				var user_query = new Parse.Query(User);
				user_query.equalTo('username', username);
				user_query.first({
					success: function(user) {
						var user_localities = user.get('localities');
						if (user_localities === undefined) {
							var temp_obj = {};
							temp_obj[locality] = 1;
							user.set('localities', temp_obj);
						} else if (user_localities[locality] === undefined) {
							user_localities[locality] = 1;
							user.set('locality', user_localities);
						} else {
							user_localities[locality] += 1;
						}
						user.save();
					},
					error: function(error) {
						console.log('saving locality to user failed : ' + error.code + ' , msg[' + error.message + ']');
					}
				});
			},
			error: function (object, error) {
				console.log('file is not queried by file_id :' + error.code + ', message[' + error.message + ']');
			}
		});
	})
	.fail (function(data) {
		console.log('!!!!! google api failed [' + data + '] file_id = ' + file_id);
	});
};

var build_reverse_geotag = function(username) {
	username = typeof username !== 'undefined' ? username : '';
	var file_query = new Parse.Query(File);

	if (username !== '') {
		/* if username is specified, update geotag of the user only
		var user_query = new Parse.Query(User);
		user_query.equalTo('username', username);
		user_query.find ({
			success: function(results) {
				console.log('retrieved users : ' + results.length);				
			}
		});
		*/

		// query files of the user
		file_query.equalTo('username', username);
	} 
	file_query.ascending('path');
	file_query.exists('latitude');
	file_query.count({
		success: function (count) {
			var query_skip = 0;
			file_query.limit(1000);
			while (query_skip * 1000 < count) {	
				file_query.skip(query_skip * 1000);
				query_skip += 1;
				file_query.find ({
					success: function (results) {
						if (results.length === 0) {
							return;
						}
						for (var i = 0; i < results.length; i++) {
							var latlng = results[i].get('latitude') + ',' + results[i].get('longitude');
							_get_reverse_geotag(latlng, results[i].id, results[i].get('username'));
						}
					}
				});
			}
		}
	});
};

build_reverse_geotag();


// Build Collaborative Filter

var build_cf = function (username) {
	username = typeof username !== 'undefined' ? username : '';
	var user_query = new Parse.Query(User);
	if (username !== '') {
		user_query.equalTo('username', username);
	}
	var cf_matrix = [];
	user_query.ascending('username');
	user_query.count({
		success: function (count) {
			var query_skip = 0;
			user_query.limit(1000);
			while (query_skip * 1000 < count) {
				user_query.skip(query_skip * 1000);
				query_skip += 1;
				user_query.find().then(function(results) {
					// per user, build cf matrix
					console.log('retrieved users : ' + results.length);
					results.forEach(function(elem, index, array) {
						// elem = user
						var per_user = {username : elem.get('username'),
							localities: {}
						};
						var file_query = new Parse.Query(File);
						file_query.equalTo('username', elem.get('username'));
						file_query.ascending('path');
						file_query.count({
							success: function(file_count) {
								var file_query_skip = 0;
								file_query.limit(1000);
								while (file_query_skip * 1000 < file_count) {
									file_query.skip(file_query_skip * 1000);
									file_query_skip += 1;
									file_query.find().then(function(files) {
										for (var i = 0; i < files.length; i++) {
											if (files[i].get('locality') === undefined) {
												continue;
											}
											if (per_user['localities'][files[i].get('locality')] === undefined) {
												per_user['localities'][files[i].get('locality')] = 1;
											} else {
												per_user['localities'][files[i].get('locality')] += 1;
											}
										}
									});
								}
							}
						});
					});
				});
			}
		}
	});
};
