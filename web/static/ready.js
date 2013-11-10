//  START CONSTANTS
var SETTINGS_SCRIPT = "./static/settings.js";
//  END CONSTANTS

//  START GLOBAL VARIABLES
var db_directory = "";
var files = [];
var exifInfo = [];
//  END GLOBAL VARIABLES

function init() {
  $.getScript(SETTINGS_SCRIPT, function(){
    main();
  });
}

//  IMPORT
var $j = JpegMeta.JpegFile;

function main() {
  //  OPEN DIRECTORY PICKER
  //  TODO

  //  READ IMAGE FILES
  $('#directory-selector').change(function(e) {
    var reader = new FileReader();
    var allfiles = e.target.files;
    $.each(allfiles, function(i, item) {
      if(item.name.indexOf(".jpg")>=0 || item.name.indexOf(".png")>=0 || item.name.indexOf(".JPG")>=0 || item.name.indexOf(".PNG")>=0)
      // console.log(item);
      files.push(item);
    });

    for(var i=0;i<files.length;i++) {
      // var tempImage = new Image();
      // tempImage.src = files[i].name;
      // EXIF.getData(tempImage, function() {
      //   console.log(EXIF.getAllTags(tempImage));
      // });
      
      var reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        var jpeg = new $j(data, files[i]);
        if (jpeg.gps && jpeg.gps.longitude) {
          console.log(jpeg.gps.latitude + ", " + jpeg.gps.longitude);
        }
      };

      reader.readAsBinaryString(files[i]);
      // loadFiles(files);
    }
  });
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