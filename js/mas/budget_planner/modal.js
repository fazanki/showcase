(function (window, $) {
  var defaults = {
    scrolling: false,
    transition: 'none',
    fixed: true,
    fastIframe: true
  };

  window.Modal = {
    open: function open(options) { $.colorbox($.extend({}, defaults, options)); },
    close: $.colorbox.close,
    getContainer: function getContainer() { return $('#colorbox'); }
  };
}(this, jQuery));
