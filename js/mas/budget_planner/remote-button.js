/*
 * This will make any button on the page with a 'data-ajax' attribute into an ajax button
 * that submits its form via ajax on click. It raises the same success, complete and error
 * events as jQuery-UJS
 *
 */

(function (window, $) {
  'use strict';

  var postParentForm = function (e) {
    var $this, $form, text;
    $this = $(this);
    $form = $this.parents('form:first');
    $.ajax({
      url: $this.attr('data-action') || $form.attr('action'),
      type: $form.attr('method'),
      data: $form.serialize() + '&' + $this.attr('name') + '=' + $this.attr('value'),
      success: function (data, status, xhr) { $this.trigger('ajax:success', [data, status, xhr]); },
      complete: function (xhr, status) { $this.trigger('ajax:complete', [xhr, status]); },
      error: function (xhr, status, error) { $this.trigger('ajax:error', [xhr, status, error]); }
    });

    e.preventDefault();
  }

  $(window.document).on('click', 'button[data-ajax], input[data-ajax]', postParentForm);

  window.RemoteButton = {
    initialize: function initialize(button) {
      $(button).on('click', postParentForm);
    }
  };
}(this, jQuery));
