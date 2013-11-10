$("#menu-close").click(function(e) {
  e.preventDefault();
  $("#sidebar-wrapper").toggleClass("active");
});

$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#sidebar-wrapper").toggleClass("active");
});

$(function() {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') || location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });

  $('#sign-in-btn').click(function(e) {
    window.location.href = "https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=4jhdfov09fjy323&redirect_uri=http://localhost:8080/code";
  });

  function getCookie(c_name)
  {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    
    if (c_start == -1) {
      c_start = c_value.indexOf(c_name + "=");
    }

    if (c_start == -1) {
      c_value = null;
    }
    else {
      c_start = c_value.indexOf("=", c_start) + 1;
      var c_end = c_value.indexOf(";", c_start);
      if (c_end == -1) {
        c_end = c_value.length;
      }
      c_value = unescape(c_value.substring(c_start,c_end));
    }

    return c_value;
  }

  if(getCookie("mytoken")!=null) {
      location.replace('http://localhost:8080/code');
  }
});