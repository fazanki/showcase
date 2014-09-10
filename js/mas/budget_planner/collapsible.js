(function (window, $) {
  'use strict';

  window.collapsible = {};
  window.collapsible.initialize = function initialize(selector, hideText, showText, buttonClasses) {

    $(selector).on('click', function () {
      var el = $(this),
        target = $(this).data('target');

      $(target).slideToggle(function () {

        if (el.text() === hideText) {
          el.html(showText);
        } else {
          el.html(hideText);
        }

        if (buttonClasses !== '') {
          el.toggleClass(buttonClasses);
        }
      });

      return false;
    });

  };

}(this, jQuery));
