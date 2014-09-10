//= require budget_planner/notifications
//= require budget_planner/remote-button
//= require budget_planner/modal

(function ($, RemoteButton, Notifications, Modal) {
  'use strict';

  var resetSuccess, resetFailure, onResetModalLoaded;

  onResetModalLoaded = function onResetModalLoaded() {
    var modal = Modal.getContainer();

    modal.on('click', '.cancel', function (e) {
      e.preventDefault();
      Modal.close();
    });
  };

  resetSuccess = function resetSuccess() {
    Notifications.displayNotice(I18n.t('budget_planner.long_forms.confirm_reset.success'));
  };

  resetFailure = function resetFailure() {
    Notifications.displayError(I18n.t('budget_planner.long_forms.confirm_reset.failure'));
  };

  $('.reset').on('click', function (e) {
    e.preventDefault();
    Modal.open({
      href: $(this).attr('href'),
      height: 170,
      width: 600,
      onComplete: onResetModalLoaded
    });
  });

}(jQuery, RemoteButton, Notifications, Modal));
