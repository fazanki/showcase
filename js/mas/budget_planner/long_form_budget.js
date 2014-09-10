//= require budget_planner/utilities
//= require budget_planner/popovers
//= require budget_planner/collapsible
//= require budget_planner/frequency-selector
//= require budget_planner/autosave-wip-budget

(function (parent, window, $, utilities, popovers, FrequencySelector, AutoSave) {
  'use strict';

  var SourceView, StepView, RunningTotalView;

if (window.enable_long_form_in_place_validation) {
  SourceView = function SourceView(container, valueInput, frequencySelector, totalOutput, totalFrequencySelector) {
    var self, changed, defaultValue, valuePerDay;
    self = this;
    changed = function changed() { $(self).trigger('change'); };
    defaultValue = '0.00';

    $(valueInput).on('keyup', changed);
    $(valueInput).on('change', changed);
    $(frequencySelector).on('change', changed);
    $(totalFrequencySelector).on('change', changed);

    $(valueInput).on('focus', function () {
      if (String(self.value()) === defaultValue) { self.setValue(''); }
    });

    valuePerDay = function valuePerDay() {
      return Number(self.value()) / frequencySelector.factor();
    };

    this.value = function value() { return $(valueInput).val().replace(/[^0-9\.]/g,''); };
    this.setValue = function setValue(value) { $(valueInput).val(utilities.prettyPrintNumber(value)); };

    this.total = function total() {
      return valuePerDay() * totalFrequencySelector.factor();
    };

    this.isValid = function isValid() {
      var value = Number(self.value());
      return !isNaN(value) && value >= 0;
    };

    this.validate = function validate() {
      var value = self.value();
      if (String(value) === '') value = defaultValue;
      self.setValue(value);

      if (self.isValid()) {
        $(container)
          .removeClass('error')
          .find('input').attr("aria-invalid", "false");
      } else {
        $(container)
          .addClass('error')
          .find('input').attr("aria-invalid", "true");
      }
    };

    this.updateTotal = function updateTotal() {
      var total;
      if (self.isValid()) {
        total = self.total();
      } else {
        total = defaultValue;
      }
      totalOutput.text(utilities.numberToCurrency(total));
    };

    $(this).on('change', self.updateTotal);
    $(valueInput).on('blur', self.validate);
    $(valueInput).on('keypress', function(e) { if (e.which == 13) self.validate(); });

    // some browsers cache entered values in inputs, so trigger a change event on load
    changed();
  };
} else {
  SourceView = function SourceView(container, valueInput, frequencySelector, totalOutput, totalFrequencySelector) {
    var self, changed, defaultValue, valuePerDay;
    self = this;
    changed = function changed() { $(self).trigger('change'); };
    defaultValue = '0.00';

    $(valueInput).on('keyup', changed);
    $(valueInput).on('change', changed);
    $(frequencySelector).on('change', changed);
    $(totalFrequencySelector).on('change', changed);

    $(valueInput)
      .on('focus', function () { if (self.value() === defaultValue) { self.setValue(''); } })
      .on('blur', function () {
        if (self.value() === '') {
          self.setValue(defaultValue);
        } else {
          self.setValue(self.value());
        }
      });

    valuePerDay = function valuePerDay() {
      return Number(self.value()) / frequencySelector.factor();
    };

    this.value = function value() { return $(valueInput).val().replace(/\,/g, '').replace(/^\s+|\s+$/g, ''); };
    this.setValue = function setValue(value) { $(valueInput).val(utilities.prettyPrintNumber(value)); };

    this.total = function total() {
      return valuePerDay() * totalFrequencySelector.factor();
    };

    this.isValid = function isValid() {
      var value = self.value();
      return !isNaN(value) && value >= 0;
    };

    this.validate = function validate() {
      if (self.isValid()) {
        $(container)
          .removeClass('error')
          .find('input').attr("aria-invalid", "false");
      } else {
        $(container)
          .addClass('error')
          .find('input').attr("aria-invalid", "true");
      }
    };

    this.updateTotal = function updateTotal() {
      var total;
      if (self.isValid()) {
        total = self.total();
      } else {
        total = defaultValue;
      }
      totalOutput.text(utilities.numberToCurrency(total));
    };

    $(this).on('change', this.updateTotal);
    $(this).on('change', this.validate);

    // some browsers cache entered values in inputs, so trigger a change event on load
    changed();
  };
}
  StepView = function StepView(sources, totalOutput, errorOutput, totalFrequencySelector) {
    var self, changed;
    self = this;
    changed = function changed() { $(self).trigger('change'); };

    $(totalFrequencySelector).on('change', changed);
    $(sources).on('change', changed);

    this.total = function total() {
      var stepTotal = 0;
      $(sources).each(function () {
        if (this.isValid()) { stepTotal += this.total() * 100; }
      });
      return stepTotal / 100;
    };

    this.updateTotal = function updateTotal() {
      $(totalOutput).text(utilities.numberToCurrency(self.total()));
    };

    this.isValid = function isValid() {
      var stepIsValid = true;
      $(sources).each(function () { stepIsValid = stepIsValid && this.isValid(); });
      return stepIsValid;
    };

    this.validate = function validate() {
      if (self.isValid()) {
        errorOutput.removeClass('error');
      } else {
        errorOutput.addClass('error');
      }
    };

    $(this).on('change', this.updateTotal);
    $(this).on('change', this.validate);
  };

  RunningTotalView = function RunningTotalView(element, frequencySelector, baseTotalPerDay, step) {
    var self, changed;
    self = this;
    changed = function changed() { $(self).trigger('change'); };

    $(frequencySelector).on('change', changed);
    $(step).on('change', changed);

    this.total = function total() {
      return (baseTotalPerDay * frequencySelector.factor()) + step.total();
    };

    this.updateTotal = function updateTotal() {
      $(element).text(utilities.numberToCurrency(self.total()));
    };

    $(this).on('change', this.updateTotal);
  };

  // ------------------------------------------------------------------------------------------------
  // Initialize and tie to dom

  $(parent).each(function initializeLongForm() {
    var $this = $(this),
      steps = [];

    $this.find('.bp-step').each(function createStepView() {
      var $thisStep, sources, stepTotalOutput, errorOutput, step, totalFrequencySelector;

      $thisStep = $(this);
      totalFrequencySelector = new FrequencySelector($thisStep.find('.show-total select'));
      stepTotalOutput = $thisStep.find('.step-total');
      errorOutput = $thisStep.find('#page-error');

      sources = $thisStep.find('.source').map(function createSourceView() {
        var $thisSource, totalOutput, valueInput, frequencySelector;

        $thisSource = $(this);
        totalOutput = $thisSource.find('.total');
        valueInput = $thisSource.find('.i-get input[type=text]');
        valueInput.val(utilities.prettyPrintNumber(valueInput.val()));
        frequencySelector = new FrequencySelector($thisSource.find('select'));

        return new SourceView(this, valueInput, frequencySelector, totalOutput, totalFrequencySelector);
      });

      step = new StepView(sources, stepTotalOutput, errorOutput, totalFrequencySelector);
      steps.push(step);

      $thisStep.find('.bp-running-total').each(function () {
        var totalOutput, baseTotalPerDay, view;
        totalOutput = $(this).find('.total');
        baseTotalPerDay = $(this).data('baseTotalPerDay');

        view = new RunningTotalView(totalOutput, totalFrequencySelector, baseTotalPerDay, step);
      });

    });

    collapsible.initialize($this.find('button[data-toggle="collapse"]'), I18n.t('budget_planner.long_forms.edit_category.hide'), I18n.t('budget_planner.long_forms.edit_category.show'), 'icon-right-dir icon-down-dir');

    AutoSave.start($this.find('form#edit_budget'), $this.find('form.budget .link-save'), steps);
  });

}('.budget_planner', this, jQuery, utilities, popovers, FrequencySelector, AutoSave));
