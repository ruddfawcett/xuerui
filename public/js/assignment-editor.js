$(function() {
  $('.add-card').on('click', function() {
    $term_container = $('.container.terms');
    $terms = $('.container.terms section');
    $to_add = $terms.last().prev().clone();
    $to_add.find('input:text').val('');
    $to_add.find('div h3').text($terms.length);
    $to_add.insertAfter($terms.last().prev());
    $terms.last().find('div.opaque h3').text($terms.length + 1);
  });

  $('#create').on('click', function() {
    let name = $('#name').val();
    let text = $('#text').val();
    let terms = $('#terms section').not('.add');

    var words = []

    var termsValid = false;
    $.each(terms, function(idx, section) {
      let zh = $(section).find('input.zh').val();
      let py = $(section).find('input.py').val();
      let en = $(section).find('input.en').val();

      termsValid = /\S/.test(zh) && /\S/.test(py) && /\S/.test(en);
      if (termsValid) {
        words.push({
          zh: zh,
          py: py,
          en: en
        });
      }
    });

    if (/\S/.test(name) && /\S/.test(text) && termsValid) {
      var data = {
        name: name,
        text: text,
        words: words
      }

      $.post(window.location.pathname, data).done(function(response) {
        if (response._id) {
          window.location.replace(window.location.pathname.replace('/create-assignment', ''));
        }
      }).fail(function(error) {
        console.log(error);
      });
    }
    else {
      words = [];
    }
  });
});
