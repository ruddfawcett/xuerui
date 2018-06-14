function validate(fields) {
  function doWork() {
    function hasValue(selector) {
      return $.trim($(selector).val()).length;
    }

    var values = false;

    $.each(fields, function(idx, field) {
      if (!hasValue('.'+field)) {
        values = true;
      }
    });

    $('.button').prop('disabled', values);
    $('.info').css({opacity: values ? 1 : 0});

    return values;
  }

  $(document).keyup(function() {
    doWork();
  });

  $(document).on('click', function() {
    doWork();
  });

  $(document).keypress(function (e) {
    if (e.which == 13) {
      e.preventDefault();
      if (!doWork()) {
        $('.button').click();
      }
      return false;
    }
  });
}
