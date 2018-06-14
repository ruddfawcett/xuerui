$(function() {
  $('#new-course').on('click', function() {
    $('#creator').css('opacity', 0).slideDown(300).animate(
      { opacity: 1 },
      { queue: false, duration: 300 }
    );

    $('#default').css('opacity', 1).slideUp(300).animate(
      { opacity: 0 },
      { queue: false, duration: 300 }
    );
  });

  $('#cancel').on('click', function() {
    $('#creator').css('opacity', 1).slideUp(300).animate(
      { opacity: 0 },
      { queue: false, duration: 300 }
    );

    $('#default').css('opacity', 0).slideDown(300).animate(
      { opacity: 1 },
      { queue: false, duration: 300 }
    );
  });

  $('#create-course').on('click', function() {
    let name = $('#creator #name').val();
    let description = $('#creator #description').val();

    if (/\S/.test(name)) {
      $.post('/course/new', {
        'name': name,
        'description': description
      }).done(function(data) {
        if (data.id) {
          window.location.replace(`/course/${data.id}`);
        }
      }).fail(function(error) {
        console.log(error);
      });
    }
    else {
      console.log('Empty title.');
    }
  });
});
