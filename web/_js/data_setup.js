var User = Parse.Object.extend("myUser");
var File = Parse.Object.extend("File");

var query_file = function(userName) {
	var query = new Parse.Query(File);
	query.equalTo('username', userName);
	query.find({
		success: function(files) {

		}
	});
};

var query_user = function(userName) {
	var query = new Parse.Query(User);
	query.equalTo("username", userName);
	query.find({
		success: function(param) {
			alert("user: " + param[0].get('username') + " , " + param[0].get('auth_code'));
		},
		error: function(error) {
			alert ("error: " + error.code + ", " + error.message);
		}
	});
};

var save_file = function(link, userName, thumbnail, latitude, longitude, date) {
	var query = new Parse.Query(File);
	query.equalTo('link', link);
	query.find({
		success: function(list) {
			if (list.length === 1) {
				list.forEach(function(elem, index, array) {
					list[0].set('link', link);
					list[0].set('username', userName);
					list[0].set('thumbnail', thumbnail);
					list[0].set('latitude', latitude);
					list[0].set('longitude', longitude);
					list[0].set('date', date);
					list[0].save();
				});
			} else if (list.length === 0) {
				var file = new File();
				file.set('link', link);
				file.set('username', userName);
				file.set('thumbnail', thumbnail);
				file.set('latitude', latitude);
				file.set('longitude', longitude);
				file.set('date', date);
				file.save(null, {
					success: function (file) {
						console.log('file saved... ' + file.get('link'));
					}
				});
			} else {
				alert ('shit. list length = ' + list.length);
			}
		}
	});
};

var save_user = function(userName, auth_code) {

	var query = new Parse.Query(User);
	query.equalTo('username', userName);
	query.find({
		success: function(list) {
			// alert("user: " + param[0].get('username') + " , " + param[0].get('auth_code'));
			if (list.length > 0) {
				list[0].set('auth_code', auth_code);
				list[0].save();
			} else {
				var user = new User(); 
				user.set("username", userName);
				user.set("password", "asdf");
				user.set("auth_code", auth_code);
				user.save(null, {
					success: function(user) {
						// success
						console.log('save...' + user.get('username'));
					},
					error: function(user, error) {
						if (error.code === 202) {
							// 202 already taken
							console.log("202 : " + user.get('username'));
							user.set("auth_code", auth_code);
							user.save(null, {
								success: function(user) {
									alert ("suc 2");
								},
								error: function(user, error) {
									alert("error2 : " + error.code + "  " + error.message);
								}
							});
							return;
						} else {
							alert("failed!" + error.message + ", error: " + error.code); 
						}
					}
				});
			}
		}
	});

};

// save_user("delta", "asdddf");
// query_user("delta");