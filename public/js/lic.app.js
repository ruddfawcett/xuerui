// Helpers

class WordScore {
  constructor() {
    this.backing_store = {
      'zh': 0,
      'py': 0,
      'en': 0
    }
  }

  update(mode, score) {
    if (['zh', 'py', 'en'].indexOf(mode) == -1) return;

    this.backing_store[mode] = score;
  }

  get total() {
    let ZH_WEIGHTED = 1;
    let PINYIN_WEIGHTED = 1;
    let EN_WEIGHTED = 1;
    return (this.backing_store.zh * ZH_WEIGHTED) + (this.backing_store.py * PINYIN_WEIGHTED) + (this.backing_store.en * EN_WEIGHTED);
  }
}

class Word {
  constructor(entry) {
    this.zh = entry.zh;
    this.en = entry.en;
    this.py = entry.py;
    this.part_of_speech = entry.part_of_speech;

    this.score = new WordScore();
  }
}

class WordList {
  constructor(words) {
    this.backing_store = {};
    var _this = this;

    $.each(words, function(i, word) {
      _this.backing_store[word._id] = new Word(word);
    });
  }

  get(key) {
    return this.backing_store[key];
  }

  get list() {
    return this.backing_store;
  }

  get keys() {
    return Object.keys(this.backing_store);
  }

  get listScore() {
    var _this = this;
    let POSSIBLE_SCORE = this.keys.length * 3;
    var cumulative_score = 0;

    $.each(this.keys, function(i, key) {
      let word = _this.backing_store[key];
      cumulative_score += word.score.total;
    });

    return cumulative_score / POSSIBLE_SCORE;
  }

  progress(raw = false) {
    let score = this.listScore;
    var percentage = score * 100;

    if (raw) {
      return score;
    }

    return ~~percentage;
  }
}

class LearnMode {
  constructor(title, text, words, mode) {
    this.title = title;
    this.backing_text = text;
    this.text = text;
    this.types = [
      'choice',
      'type'
    ];

    this.active_node = null;
    this.practice = false;

    this.type = this.randomType();

    this.round = 1;
    this.word_index = 0;
    this.num_attempts = 0;

    this.mode = mode;
    this.current_mode = mode;

    this.words = new WordList(words);
    this.reviewed = [];
    this.correct = [];
    this.incorrect = [];
  }

  start() {
    var _this = this;

    $.getJSON(window.location.pathname+'/progress').done(function(result) {
      if (result) {
        if (typeof result.rounds != 'undefined') {
          if (result.rounds.length > 0) {
            $('#intro2 p').text("You're live! Everything you do from now on will be recorded. Don't worry, though, only your progress on the last quiz counts as your final grade.");
            _this.mastery = new MasteryStorage(result.rounds);
            $('.container#intro2').show();
            $('.container#progress').show();
          }
        }
        else {
          _this.mastery = new MasteryStorage([]);
          return _this.setup();
        }
      }
    }).fail(function(error) {
      console.log(error);
    }).always(function() {
      if (!_this.mastery.neverPracticed) {
        _this.populateHistory();
        this.practice = false;
        if (_this.mastery.shouldRun) {
          _this.populate();
          _this.nextAnswer();
        }
        else {
          _this.populateTimer();
        }
      }
    });
  }

  run() {
    this.populateHistory();

    if (!this.practice) {
      $('#intro2 p').text("You're live! Everything you do from now on will be recorded. Don't worry, though, only your progress on the last quiz counts as your final grade.");

      if (this.mastery.shouldRun) {
        this.populate();
        this.nextAnswer();
      }
      else {
        console.log(true);
        this.populateTimer();
      }
    }

    if (this.practice) {
      this.populate();
      this.nextAnswer();
    }
  }

  setup() {
    $('.module').hide();
    $('.container#intro').show();
    var _this = this;

    $('ul#toggle-text li').on('click', function() {
      $('ul#toggle-text li.selected').removeClass('selected');
      $(this).addClass('selected');
      if (_this.mastery.neverPracticed) {
        _this.populateText(false, $(this).data('lang'));
      }
    });

    $('#start-reviewing').one('click', function() {
      $('.module').show();
      $('.container#intro').hide();
      $('.container#intro2').show();
      $('.container#progress').show();
      _this.practice = true;
      _this.run();
    });

    this.populate(true);
  }

  addChoiceListeners() {
    var _this =  this;

    $('.option').on('click', function() {
      _this.selected($(this));
    });

    $(document).unbind('keyup').bind('keyup', function(e) {
      let idx = parseInt(e.key) - 1;
      if (!isNaN(idx) && idx < 4) {
        var node = $($('.option').get(idx));
        return _this.selected(node);
      }
    });
  }

  addTextListeners() {
    var _this =  this;

    $('.option input[type="button"]').on('click', function() {
      _this.responded();
    });

    $(document).bind('keypress', function(e) {
      if (e.which == 13) {
        _this.responded();
      }
    });
  }

  removeListeners() {
    $(document).unbind('keyup');
    $(document).unbind('keypress');
    $('.option').unbind('click');
    $('.option input[type="button"]').unbind('click');
  }

  populateTimer() {
    var _this = this;
    this.text = this.backing_text;

    $('.title h1').text(this.title);
    $('.body p').html(this.text);

    $('.body p').html(this.text);
    $('.number .round-master').text(this.mastery.count);

    $.each(this.words.keys, function(i, key) {
      var entry = _this.words.list[key];
      _this.text = _this.text.replace(entry.zh, `<span class='key-word highlighted' data-key='${key}'>${entry.zh}</span>`);
    });

    $('.body p').html(this.text);

    var timeString = function() {
      return moment().to(_this.mastery.availableAt, true);
    }

    $('.options').append(`
      <div class='option full'>
          <p><b>晚一点回来！</b> You can come back and quiz in <span class='from-now'>${timeString()}</span>. Review the text until then.</p>
        </div>
      </div>`);

    var interval = setInterval(function() {
      if (_this.mastery.availableAt - moment() <= 0) {
        clearInterval(interval);
        $('.options').empty();
        return _this.run();
      }

      $('.option .from-now').text(timeString());
    }, 1000);
  }

  populate(highlighter = false) {
    $('.title h1').text(this.title);
    $('.number .round-total').text(Object.keys(this.words.list).length);
    $('.number .round-master').text(this.mastery.count);

    this.populateText(highlighter);
  }

  populateText(highlighter = false, lang = null) {
    var _this = this;
    this.text = this.backing_text;

    if (lang === null) {
      lang = _this.current_mode;
    }

    $.each(this.words.keys, function(i, key) {
      var entry = _this.words.list[key];
      // let word_bg = highlighter ? 'highlighted' : 'gray';
      let word_bg = 'gray';
      _this.text = _this.text.replace(entry.zh, `<span class='key-word ${word_bg}' data-key='${key}'>${entry[lang]}</span>`);
    });

     $('.body p').html(this.text);
  }

  populateHistory() {
      if (this.mastery.count > 0) {
      if ($('.header.rounds').length == 0) {
        $('.sidebar .container#progress').append(`
          <div class='header rounds'>
            <h2>Progress</h2>
          </div>
          <div class='all-rounds'></div>`);
      }

      $('.all-rounds').empty();

      $.each(this.mastery.history, function(i, round) {
        var health = 'green';
        if (round.progress <= .8) {
          health = 'yellow';
          if (round.progress <=.5) {
            health = 'red';
          }
        }

        $('.all-rounds').prepend(`
          <div class='progress'>
            <h3 class='number ${health}'>${~~(round.progress * 100)}%</h3>
            <p>Round ${round.round}</p>
          </div>`);
      })
    }
  }

  addMultipleChoice() {
    var _this = this;

    var keys = this.words.keys;
    var stripped_word = keys.splice(keys.indexOf(this.active_node.data('key')), 1)[0];

    var shuffled = this.shuffle(keys);
    var selected = shuffled.slice(0, 3);

    selected.push(this.active_node.data('key'));
    selected = this.shuffle(selected);

    $.each(selected, function(i, key) {
      $('.options').append(_this.buildChoice(i + 1, key));
    });

    this.addChoiceListeners();
  }

  addTextBox(key) {
    var _this = this;

    $('.options').append(`
      <div class='option input'>
        <input type='text' placeholder='' data-key='${key}' />
      </div>
      <div class='option submit'>
        <input type='button' value='Answer' />
      </div>`);

    $('.option input[type="text"]').focus();

    this.addTextListeners();
  }

  buildChoice(idx, key) {
    var entry = this.words.list[key];
    return `<div class='option multiple-choice' data-key='${key}'>
              <p>${entry[this.nextMode()]} <span class='key'>${idx}</span></p>
            </div>`;
  }

  selected(option) {
    if (option.data('key') == this.active_node.data('key')) {
      this.correctResponse();
    } else {
      this.incorrectResponse();
    }
  }

  responded(key) {
    var key = this.active_node.data('key');
    var response = $('.option input[type="text"]').val();

    var entry = this.words.get(key);
    var answer = entry[this.nextMode()];

    if (response == answer) {
      this.correctResponse();
    } else {
      this.incorrectResponse();
    }
  }

  nextAnswer() {
    this.active_node = $($('.key-word').get(this.word_index));
    this.active_node.removeClass('gray');
    this.active_node.addClass('highlighted');

    if (this.mastery.count < 4) {
      return this.addMultipleChoice();
    }

    // if (this.randomType() == 'choice') {
      this.addMultipleChoice();
    // }
    // else {
    //   this.addTextBox();
    // }
  }

  incorrectResponse() {
    this.active_node.addClass('incorrect');
    this.num_attempts++;
  }

  correctResponse() {
    var _this = this;
    this.active_node.removeClass('incorrect');
    let key = this.active_node.data('key');

    if (this.num_attempts == 0) {
      var word = this.words.get(this.active_node.data('key'));
      word.score.update(this.current_mode, 1);

      $('.number .percentage').text(this.words.progress());
    }
    else {
      this.incorrect.indexOf(key) === -1 ? this.incorrect.push(key) : false;
    }

    this.reviewed.indexOf(key) === -1 ? this.reviewed.push(key) : false;

    $('.number .word-counter').text(this.reviewed.length);

    this.num_attempts = 0;
    this.word_index++;

    this.active_node.removeClass('highlighted');
    this.active_node.text(this.active_node.data(this.nextMode()));

    if (this.word_index == this.words.keys.length) {
      this.reviewed = [];
      this.word_index = 0;

      if (this.round == 3) {
        this.round = 1;

        this.current_mode = this.mode;

        $('.number .percentage').text(0);
        $('.number .word-counter').text(0);

        $('.options').empty();

        if (!this.practice) {
          return this.mastery.update(this.words.progress(true), this.correct, this.incorrect, function() {
            _this.reviewed = [];
            _this.correct = [];
            _this.incorrect = [];
            return _this.run();
          });
        }
        else {
          this.practice = false;
          $('#intro2 p').text("You're live! Everything you do from now on will be recorded. Don't worry, though, only your progress on the last quiz counts as your final grade.");

          this.reviewed = [];
          this.correct = [];
          this.incorrect = [];

          return this.run();
        }
      }

      this.current_mode = this.nextMode();
      $('.number .word-counter').text(0);

      this.round++;

      this.populateText();
    }

    $('.options').empty();
    this.nextAnswer();
  }

  nextMode() {
    if (this.current_mode == 'en') return 'py';
    else if (this.current_mode == 'py') return 'zh';
    else if (this.current_mode == 'zh') return 'en';
    else return false;
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  randomType() {
    let idx = Math.floor(Math.random() * Math.floor(2));
    return this.types[idx];
  }
}

class MasteryStorage {
  constructor(data) {
    this.backing_store = data;
  }

  update(progress, correct, incorrect, cb) {
    var _this = this;

    var latest_round = 1;
    if (!this.isEmpty) {
      latest_round = this.backing_store.length + 1;
    }

    var timestamp = moment();
    let interval = this.nextRoundFrom(latest_round);
    let next_at = timestamp.clone().add(interval, 'minutes');

    timestamp = timestamp.toDate();
    next_at = next_at.toDate();

    let latest = {
      'round': latest_round,
      'progress': progress,
      'completed_at': timestamp,
      'next_at': next_at,
      'correct': correct,
      'incorrect': incorrect
    }

    $.post(window.location.pathname+'/progress', latest).done(function(result) {
      if (result) {
        _this.backing_store = result.rounds;
        console.log('[Rui] Successfully updated user progress...');
      }
    }).fail(function(xhr, status, error) {
      console.log(error);
    }).always(function() {
      return cb();
    });
  }

  nextRoundFrom(round) {
    // Three review rounds without a time cap.
    if (round <= 1) {
      return 0;
    }

    // After x rounds, come back after:
    // First "real round."
    if (round == 2) return 5;
    if (round == 3) return 10;
    if (round == 4) return 15;
    if (round == 5) return 30;
    if (round == 6) return 60 * 2;
    if (round == 7) return 60 * 3;
    if (round == 8) return 60 * 6;
    if (round == 9) return 60 * 12;
    if (round == 10) return 60 * 24;
    if (round == 11) return 60 * 48;
  }

  get isEmpty() {
    return this.backing_store.length == 0;
  }

  get neverPracticed() {
    return this.count == 0;
  }

  get shouldRun() {
    if (this.backing_store.length < 1) {
      return true;
    }
    let last_object = this.backing_store[this.backing_store.length - 1];
    return this.backing_store.length <= 11 && moment() > moment(last_object.next_at);
  }

  get availableAt() {
    let last_object = this.backing_store[this.backing_store.length - 1];
    return moment(last_object.next_at);
  }

  get count() {
    return this.backing_store.length;
  }

  get history() {
    return this.backing_store.sort(function(a, b) {
      return a.round > b.round;
    });
  }
}
