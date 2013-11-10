//  START CONSTANTS
var SETTINGS_SCRIPT = "./static/settings.js";
//  END CONSTANTS

//  START GLOBAL VARIABLES
var db_directory = "";
var allfiles = [];
var exifInfo = [];
//  END GLOBAL VARIABLES

function init() {
  //  START EVENT HANDLERS
  $('#directory-selector').change(function(e) {
    var reader = new FileReader();
    var thefiles = e.target.files;
    $.each(thefiles, function(i, item) {
      allfiles.push(item);
    });
  });

  //  END EVENT HANDLERS

  $.getScript(SETTINGS_SCRIPT, function(){
    main();
  });
}

function main() {
  //  OPEN DIRECTORY PICKER
  
}

if (parent) {
  if(window.addEventListener) {
    window.addEventListener('load', init, false);
  } else if(window.attachEvent) {
    window.attachEvent('onload', init);
  }
} else {
  $(document).ready(function() {
    init();
  });
}