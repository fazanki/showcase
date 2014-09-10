//= require js-routes
//= require budget_planner/notifications
//= require budget_planner/modal

(function (window, $, Notifications, Routes, Modal) {
  'use strict';

  var commitFailure, createNeeded, onOverwriteModalLoaded;

  onOverwriteModalLoaded = function onOverwriteModalLoaded() {
    var modal = Modal.getContainer();

    modal.on('ajax:error', function () {
      Modal.close();
      commitFailure();
    });

    modal.find('#overwrite_cancel').on('click', function (e) {
      e.preventDefault();
      Modal.close();
    });
  };

  commitFailure = function commitFailure() {
    Notifications.displayError(I18n.t('budget_planner.long_forms.load.failure'));
  };

  createNeeded = function loadNeeded(event, options) {
    if ($('form#edit_budget').is('*') && !options.xhr.getResponseHeader('X-MAS-ConfirmOverwrite') && !options.xhr.getResponseHeader('X-MAS-BudgetCommitted')) {
      var url;
      if($('.ShortFormBudgetPlanner')[0]) {
        url = Routes.budget_planner_load_short_form_path(default_url_options);
      } else {
        url = Routes.budget_planner_load_long_form_path(default_url_options);
      }
      $.ajax({
        url: url,
        success: function (data, status, xhr) {
          // we show load confirmation only if user has budget
          Modal.open({
            html: data,
            height: 200,
            width: 600,
            onComplete: onOverwriteModalLoaded
          });
        },
        error: function (xhr, status, error) { /* do nothing, user does not have budget, so we do not care */}
      });
    }
  };

  $(window.document).on('signed_in.mas', createNeeded);

}(this, jQuery, Notifications, Routes, Modal));
