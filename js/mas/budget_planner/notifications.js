(function (window, $) {
  var display = function display(text, selector) {
    $(selector).text(text)
      .show()
      .delay(1500);
     // .fadeOut(900);
   // $(window).scrollTop(0);
  };

  var displayNotice = function displayNotice(text) {
    display(text, 'form.budget .notice');
  };

  var displayError = function displayError(text) {
    display(text, 'form.budget .error');
  };

  window.Notifications = {};
  window.Notifications.displayNotice = displayNotice;
  window.Notifications.displayError = displayError;
}(this, jQuery));
