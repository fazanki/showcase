//= require budget_planner/remote-button
//= require budget_planner/modal

(function (window, $, RemoteButton, Modal) {
  'use strict'

  var onRetrieveModalLoaded = function onRetrieveModalLoaded() {
    var modal = Modal.getContainer();

    modal.find('input[type=submit]').each(function () {
      RemoteButton.initialize(this);
    });

    modal.on('ajax:success', function (e, data, status, xhr) {
      window.location = xhr.getResponseHeader('Location');
    });

    modal.on('ajax:error', function (e, xhr, status, error) {
      modal.find('.error').html(I18n.t('budget_planner.legacy_budgets.index.error')).show();
    });

    modal.find('.cancel').on('click', function (e) {
      e.preventDefault();
      Modal.close();
    });
  };

  $('.link-retrieve[data-ajax]').on('ajax:success', function () {
    Modal.open({
      href: $(this).val(),
      height: 200,
      width: 650,
      onComplete: onRetrieveModalLoaded
    });
  });

}(this, jQuery, RemoteButton, Modal));
