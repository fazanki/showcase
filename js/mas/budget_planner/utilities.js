(function(window, $) {
  window.utilities = {}

  window.utilities.numberToCurrency = function numberToCurrency(number, options) {
    var result, precision_match, precision = 0, negative = '';
    var settings = $.extend({}, { currencySymbol: '£', precision: 2},  options );

    number = Number(number) * 100;
    precision_match = String(number).match(/[^\.]\d+$/);
    if (precision_match) {
      precision = precision_match[0].length;
    }
    if (precision > 2) {
      for (var x = precision; x > 2; x--) {
        number = Number(number).toFixed(x);
      }
    }

    negative = Math.abs(number) != number ? '-' : '';
    result = (Math.round(Math.abs(number))/100).toFixed(settings.precision).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    return negative + settings.currencySymbol + result;
  };

  window.utilities.prettyPrintNumber = function prettyPrintNumber(number) {
    return String(number).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

})(this, jQuery);
