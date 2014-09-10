(function ($, _gaq) {
  'use strict';

  var trackClick = function trackClick(selector, action, label) {
    $(selector).on('click', function () {
      _gaq.push(['_trackEvent', 'HTML Tools - Budget Planner', action, label]);
    });
  };

  trackClick('.budget_planner .link-save', 'Save', 'Click');
  trackClick('.budget_planner .link-print', 'Print', 'Click');
  trackClick('.budget_planner .DownloadSpreadsheet', 'Download', 'xls');

  $('.budget_planner .skip').on('click', function () {
    var $form = $(this.form);
    $form.append('<input type="hidden" name="analytics[action]" value="Skip to Results" />');
    $form.append('<input type="hidden" name="analytics[label]" value="' + window.location.href + '" />');
  });

}(jQuery, _gaq));
