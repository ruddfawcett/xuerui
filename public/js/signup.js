$(function() {
  $('.button').bind('click touchstart', function() {
    function hasValue(obj) {
      return $.trim($(obj).val()).length;
    }

    var first = $('.first');
    var last = $('.last');
    var role = $('.role');
    var email = $('.email');
    var password = $('.password');

    if (!hasValue(first) || !hasValue(last) || !hasValue(role) || !hasValue(email) || !hasValue(password)) {
      $('.message').text('Please complete the entire form.').fadeIn().delay(2000).fadeOut();
      return;
    }
    else {
      var payload = {
        user: {
          name: {
            first: first.val(),
            last: last.val()
          },
          role: role.val(),
          email: email.val(),
          password: password.val()
        }
      }

      $.ajax({
        type: 'POST',
        url: '/signup',
        data: payload,
        beforeSend: function() {
          $('.loading').show();
        },
        complete: function() {
          $('.loading').hide();
        },
        success: function(result) {
          if (result.code === 201) {
            $('.message').text('Your account was created, a verification email has been sent.').fadeIn();
          }
          else if (result.code === 409) {
            $('.message').text('A user with that email already exists.').fadeIn().delay(2000).fadeOut();
          }
          else {
            $('.message').text('Error creating your account.').fadeIn().delay(2000).fadeOut();
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          $('.message').text('Error creating your account.').fadeIn().delay(2000).fadeOut();
        }
      });
    }
  });
});
