//= require budget_planner/notifications
//= require budget_planner/remote-button
//= require budget_planner/modal

(function (window, $, RemoteButton, Notifications, Modal) {
  'use strict';

  var commitSuccess, commitFailure, overwriteNeeded, onCommitAttempted, onCommitModalLoaded;

  onCommitModalLoaded = function onCommitModalLoaded() {
    var modal = Modal.getContainer();

    modal.find('button, input[type=submit]').each(function () {
      RemoteButton.initialize(this);
    });

    modal.on('ajax:success', function () {
      Modal.close();
      commitSuccess();
    });

    modal.on('ajax:error', function () {
      Modal.close();
      commitFailure();
    });

    modal.find('.cancel').on('click', function (e) {
      e.preventDefault();
      Modal.close();
    });
  };

  commitSuccess = function commitSuccess() {
    Notifications.displayNotice(I18n.t('budget_planner.long_forms.commit.success'));
    Analytics.sendEvent('Save Complete');
  };

  commitFailure = function commitFailure() {
    Notifications.displayError(I18n.t('budget_planner.long_forms.commit.failure'));
  };

  overwriteNeeded = function overwriteNeeded(location) {
    Modal.open({
      href: location,
      height: 200,
      width: 600,
      onComplete: onCommitModalLoaded
    });
  };

  onCommitAttempted = function onCommitAttempted(xhr, definitelyTriedToSave) {
    var location, confirmOverwrite;
    location = xhr.getResponseHeader('Location');
    confirmOverwrite = xhr.getResponseHeader('X-MAS-ConfirmOverwrite');
    if (confirmOverwrite && location) {
      overwriteNeeded(location);
    } else if (definitelyTriedToSave || xhr.getResponseHeader('X-MAS-BudgetCommitted')) {
      commitSuccess();
    }
  };

  $('form.budget .link-save, .ShortFormBudgetPlanner button[name="commit"]').on('ajax:success', function (event, response, status, xhr) {
    onCommitAttempted(xhr, true);
  });

  $(window.document).on('signed_in.mas', function (event, options) {
    onCommitAttempted(options.xhr);
  });

}(this, jQuery, RemoteButton, Notifications, Modal));
