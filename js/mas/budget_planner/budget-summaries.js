//= require budget_planner/utilities
//= require budget_planner/frequency-selector

(function (window, $, utilities, FrequencySelector) {
  'use strict';

  var frequencySelector, app, numberToCurrency, TotalView;

  numberToCurrency = utilities.numberToCurrency;

  TotalView = function TotalView(element, valuePerDay, frequencySelector) {
    var updateTotal;

    updateTotal = function updateTotal(value) {
      $(element).text(numberToCurrency(value));
    };

    $(frequencySelector).on('change', function() {
      updateTotal(valuePerDay * this.factor());
    });
  };

  // ------------------------------------------------------------------------------------------------
  // Initialize and tie to dom

  app = window.App = window.App || {};

  frequencySelector = new FrequencySelector($('#budget_frequency'));

  app.totals = $('.total[data-value-per-day]').map(function() {
    var valuePerDay = $(this).data('valuePerDay');
    if (!isNaN(valuePerDay)) {
      return new TotalView(this, valuePerDay, frequencySelector);
    }
  });


}(this, jQuery, utilities, FrequencySelector));
