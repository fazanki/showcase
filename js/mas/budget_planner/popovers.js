/*jslint unparam: true, white: true, indent: 2 */
(function (window) {
  'use strict';
  var $ = window.jQuery,
      tooltips = '.source, .StepInput, .Source',
      instructionSelector = '.help-message, .HelpMessage',
      labelSelector = '.title label, label.SourceTitle',
      closeBtnSelector = '.btn-close';

  window.popovers = {};
  window.popovers.initialize = function initialize(context) {
    $(context || tooltips).each(function (index) {
      var context = $(this),
          label = context.find(labelSelector),
          instruction = context.find(instructionSelector),
          helpBtn,
          closeBtn;

      instruction.before('<button class="btn-help icon-white-question"><span class="visuallyhidden">show help</span></button>');
      instruction.attr('aria-expanded', 'false');
      if (label.text()) { instruction.prepend('<h3>' + label.text() + '</h3>'); }
      instruction.append('<button class="btn-close">×</button>');

      helpBtn = context.find('.btn-help');
      helpBtn.attr('aria-controls', context.next(instructionSelector).attr('id'));
      helpBtn.on('click', function (event) {
        var wasClosed = $(this).text() === 'show help';
        window.popovers.closeAll(instructionSelector);
        if (wasClosed) {
          instruction.show();
          $(this).find('span').html('hide help');
          instruction.attr('aria-expanded', 'true');
        }
        return false;
      });

      closeBtn = context.find(closeBtnSelector);
      closeBtn.on('click', function () {
        var parent = $(this).parent();
        parent.hide();
        parent.prev().find('span').html('show help');
        return false;
      });
    });
  };

  window.popovers.initializeFull = function initialize() {
    window.popovers.initialize();
    $(window.document).on('click', function () {
      window.popovers.closeAll(instructionSelector);
    });
  };

  window.popovers.closeAll = function closeAll() {
    $(instructionSelector).hide();
    $(instructionSelector).attr('aria-expanded', 'false');
    $('.btn-help').find('span').html('show help');
  };

  window.popovers.initializeFull();

}(this));
