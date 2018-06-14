$(function() {
  $('.button').bind('click touchstart', function() {
    var credentials = {
      strategy: 'local',
      email: $('.email').val().trim().toLowerCase(),
      password: $('.password').val().trim()
    }

    $.ajax({
      type: 'POST',
      url: '/authentication',
      data: credentials,
      beforeSend: function(jqXHR, settings) {
        $('.loading').show();
      },
      complete: function() {
        $('.loading').hide();
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(result) {
        if (result.code === 200 || result.code === 201 || result.accessToken) {
          window.location = '/';
        }
        else if (result.code === 401) {
          $('.message').text('Could not find a user with that username and password.').fadeIn().delay(2000).fadeOut();
        }
        else if (result.code === 403) {
          $('.message').text('Please verify your account before proceeding.').fadeIn().delay(2000).fadeOut();
        }
        else {
          console.log(result);
          $('.message').text('Error logging in.').fadeIn().delay(2000).fadeOut();
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest);
        var message = XMLHttpRequest.responseJSON.message;
        $('.message').text(message.substr(message.length - 1) != '.' ? message + '.' : message).fadeIn().delay(2000).fadeOut();
      }
    });
  });
});
