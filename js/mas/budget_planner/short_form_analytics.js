(function ($, _gaq) {
  'use strict';

  var step_name = $('input[type="hidden"][name="step_name"]').val();

  var sendEvent = function(action, opt_label, opt_noninteraction) {
    var opt_value = undefined;
    _gaq.push(['_trackEvent', 'Budget Planner - Short Form', action, (opt_label || step_name), opt_value, !!opt_noninteraction]);
  }

  var trackClick = function trackClick(selector, action, opt_label) {
    $(document).on('click', selector, function (event) {
      sendEvent(action, opt_label);
    });
  };
  window.Analytics = {
    trackClick: trackClick,
    sendEvent: sendEvent
  };
  $(document).on('change', '.Source .Frequency select', function(e) {
    sendEvent('Frequency - source', $(this).find(':selected').val());
  });

  trackClick('.ManageCalculator',         'Calculator');
  trackClick('.ShortFormBudgetPlanner button[name="commit"]', 'Save Click');
  trackClick('.ShortFormBudgetPlanner .link-print', 'Print');
  trackClick('.ShortFormBudgetPlanner .link-email-results', 'Email Click');
  trackClick('.ShortFormBudgetPlanner .DownloadSpreadsheet', 'Download', 'xls');

  $(document).on('change', '.StepInput-value'        , function() { sendEvent('Enter Amount - step'   , undefined, true); });
  $(document).on('change', '.Amount-input'           , function() { sendEvent('Enter Amount - source' , undefined, true); });
  $(document).on('slidestop', '.StepInput .ui-slider', function(e, ui) {
    if(!window.Analytics.slidetracked) {
      sendEvent('Amount Slider - step'  , undefined, true);
    }
    window.Analytics.slidetracked=true;
  });
  $(document).on('slidestop', '.Source .ui-slider'   , function(e, ui) {
    if(!window.Analytics.slidetracked) {
      sendEvent('Amount Slider - source', undefined, true);
    }
    window.Analytics.slidetracked=true;
  });

  $('.ShortFormBudgetPlanner .Button---next').on('click', function () {
    var $form = $(this.form);
    $form.append('<input type="hidden" name="analytics[action]" value="Next" />');
    $form.append('<input type="hidden" name="analytics[label]" value="' + $('input[name="step_name"]').val() + '" />');
  });

  $(function() {
    if(!window.Zenbox) return;
    var real_zenbox_show = Zenbox.show;
    Zenbox.show = function(options) {
      real_zenbox_show();
      sendEvent('Feedback Click');
    }
  });

}(jQuery, _gaq));
