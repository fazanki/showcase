//= require budget_planner/utilities
//= require budget_planner/frequency-selector

(function (window, $, utilities) {
  'use strict';

  window.shortForm = {

    frequencyTransform: {

      makeHtml: function (select) {
        var options = select.find('option'),
          html = [];
        options.each(function () {
          var text = $(this).text(),
            theClass = ($(this).attr('selected') === "selected") ? 'isSelected' : '',
            link = '<button class="' + theClass + '">' + text + '</button>';
          html.push(link);
        });

        return html.join('');
      },

      getSelect: function (source) {
        var select = $(source).find("select");
        return select;
      },

      hideSelect: function ($source) {
        $source.find('select').hide();
      },

      appendHtml: function (html, select) {
        var newHtml = $('<div class="FrequencySelector"></div>').append(html);
        $(newHtml).insertBefore(select);
      },

      bindSelectClick: function (source) {

        var button = source.find('.FrequencySelector button'),
          select = source.find('select'),
          option = source.find('option'),
          input = source.find('.Amount-input, .StepInput-value'),
          self = this;

        button.on('click', function (e) {
          e.preventDefault();
          button.removeClass('isSelected');
          $(this).addClass('isSelected');
          var index = $(this).index();
          select.prop("selectedIndex", index);
          option.removeAttr('selected');
          $(option.get(index)).attr('selected', 'selected');

          select.trigger('change');
          shortForm.calculate.updateStepAndGlobalTotal();

          if(source.find('.ui-slider').is(':visible')) {
            source.find('.ui-slider').remove();
            shortForm.generateSliders.init(source);
          }
        });
        input.on('blur', function(){
            source.find('.ui-slider').remove();
            window.shortForm.generateSliders.init(source);
        });
      },

      init: function ($source) {
        var self = this;
        $source.each(function () {
          var getSelect = self.getSelect(this),
            html = self.makeHtml(getSelect),
            select = $(this).find('select');
          self.appendHtml(html, select);
          self.hideSelect($(this));
          self.bindSelectClick($(this));
        });
      }
    },

    calculate: {

      validateAndSetInput: function(inputElement, e) {
        var self = this,
            value = parseFloat(inputElement.val().replace(/[^0-9\.]/g,''));

        if(isNaN(value)) value = 0;

        if (e && ((e.type == "blur") || (e.type == "keypress" && e.which == 13))) inputElement.val(value.toFixed(2));
        return value;
      },

      setStepTotal: function (stepTotal) {
        var sTotal = utilities.numberToCurrency(stepTotal, { currencySymbol: '' });
        $('.StepInput-value').val(sTotal);
      },

      setGlobalTotal: function (stepTotal) {
        var globalTotalInput = $('.TotalRemaining-total'),
          globalTotalInputVal = parseFloat(globalTotalInput.data('balance-excluding-current-step')),
          STotal = 0;

        stepTotal = isNaN(stepTotal) ? 0 : parseFloat(stepTotal);

        if (window.step_type == 'income') {
          STotal = globalTotalInputVal + stepTotal;
        } else {
          STotal = globalTotalInputVal - stepTotal;
        }
        STotal = utilities.numberToCurrency(STotal, { precision: 0 });
        globalTotalInput.html(STotal);
      },

      getStepTotal: function (e) {
        var self = this,
            sourceTotal = parseFloat(self.getSourceTotals(e)),
            stepFrequency = "month",
            stepTotal = sourceTotal * window.FACTORS[stepFrequency];

        return stepTotal;
      },

      getSourceTotals: function (e) {
        var self = this,
            sourceTotal = 0;
        $('.Source').each(function () {
          var inputElement = $(this).find('.Amount-input'),
              frequency = $(this).find('select').val(),
              rawValue = self.validateAndSetInput(inputElement, e),
              value = rawValue / window.FACTORS[frequency];

          sourceTotal += value;
        });

        return sourceTotal;
      },

      init: function ($source, $stepInput) {
        var stepInput = ($stepInput === undefined) ? 0 : $stepInput, self = this;

        $source.each(function () {
          $(this).find('.Amount-input').on('keypress keyup blur', self.onSourceInputChange);
        });

        if (stepInput) {
          var input = $stepInput.find('.StepInput-value');
          input.on('keypress keyup blur', self.onStepInputChange);
        }
      },

      updateGlobalTotal: function(e) {
        var self = this,
            stepTotal = parseFloat(self.getStepTotal(e));
        self.setGlobalTotal(stepTotal);
      },
      updateStepAndGlobalTotal: function(e) {
        var self = this,
            stepTotal = parseFloat(self.getStepTotal(e));
        self.setStepTotal(stepTotal);
        self.updateGlobalTotal(e);
      },

      onSourceInputChange: function (e) {
        var self = shortForm.calculate;

        self.updateStepAndGlobalTotal(e);
      },

      onStepInputChange: function (e) {
        var self = shortForm.calculate,
            inputElement = $(this);

        var value = self.validateAndSetInput(inputElement, e);

        self.setGlobalTotal(value);
      }
    },

    /// sliders script
    generateSliders: {

      init: function ($lineItem) {
        $('body').attr('role', 'application');

        $lineItem.each(function () {
          var $this = $(this),
            input = $this.find('input.Amount-input, input.StepInput-value'),
            thisLabel = $this.find('label[for=' + input.attr('id') + ']'),

           // thisUnits = input.attr('data-units'),
            selectedFreqency = $this.find('select').length ? $this.find('select').val() : "month",
            maxValue = window.maxValues[selectedFreqency],
            friendlyVal = input.val() + ' ' + 'pounds',
            slider = $('<div></div>');

          thisLabel.attr('id', thisLabel.attr('for') + '-label');

          $this.append(slider);

          slider.slider({
            min: 0,
            max: maxValue,
            value: parseInt(input.val().replace(/[^0-9\.]/g,''), 10) || 0,
            range: 'min',
            step: 5
          });

          slider.bind('slide', function (e, ui) {
            input.val(ui.value.toFixed(2));

            friendlyVal = input.val() + ' ' + 'pounds';
            input.trigger('keyup');

            slider.find('a').attr({
              'aria-valuenow': input.val(),
              'aria-valuetext': friendlyVal,
              'title': friendlyVal
            });
          });
        });
      }
    },

    disableEnableEstimateRegion: function($slider) {
      var $stepInputVal = $('.Step .StepInput-value'),
          $stepTitleFirstSpan = $('.Step h3 span:first-child'),
          $stepTitleSecondSpan = $('.Step h3 span:last-child');

      if( $('.SlideToggle').is(":visible")) {
        $stepTitleFirstSpan.addClass('visiblityHidden');
        $stepTitleSecondSpan.removeClass('visiblityHidden');
        $stepInputVal.attr('disabled', 'disabled');
        $slider.slideUp('fast');
      } else {
        $stepTitleFirstSpan.removeClass('visiblityHidden');
        $stepTitleSecondSpan.addClass('visiblityHidden');
        $stepInputVal.removeAttr('disabled');
        $slider.slideDown('fast');
      }
    },

    slideToggle: function (el, $trigger, $stepInput) {
      var $toSlide = $(el.get(1)),
      $slider = $(el.get(0)).find('.ui-slider'),
      self = this;

      $trigger.on('click', function (e) {
        e.preventDefault();
        $toSlide.slideToggle('medium', function() {
          var useEstimate = !$toSlide.is(':visible');
          self.setUseEstimate($stepInput, useEstimate);
          self.disableEnableEstimateRegion($slider);
          self.clearOrDisplayStepEstimate($stepInput.find('.StepInput-value'), useEstimate);
        });

        self.toggleManageCalculatorBtn($('.ManageCalculator'));

        $('.Sources').attr('tabindex', '-1').focus();
      });
    },

    toggleManageCalculatorBtn: function($manageCalculator) {
      $manageCalculator.children('span').toggleClass('visiblityHidden');
    },

    clearOrDisplayStepEstimate: function (stepTotalInput, useEstimate) {
      var self = this,
          $stepTotalInput = $(stepTotalInput),
          estimatedValue;

      if (useEstimate) {
        estimatedValue = self.estimatedValue || $stepTotalInput.data('estimatedValue') || '0.00';
        $stepTotalInput.val(estimatedValue);
        shortForm.calculate.setGlobalTotal(estimatedValue);
      } else {
        self.estimatedValue = $stepTotalInput.val();
        shortForm.calculate.updateStepAndGlobalTotal();
      }
    },

    setUseEstimate: function ($stepInput, useEstimate) {
      $stepInput.find('.StepInput-useEstimate').val(useEstimate);
    },

    clearDefaultValue: function ($this) {
      $this.on('focus', '.Amount-input, .StepInput-value', function (e) {
        if ($(this).val() === '0.00') { $(this).val(''); }
      });
    },

    chart: function(renderTo, width) {
      if(!$('#'+renderTo)[0]) { return; }

      var data = [], // empty so no chart rendered if user hasn't set any form values yet
          thresholdForLarge = 720,
          backgroundColor,
          windowWidth = $( window ).width(),
         largeConfig = {
            allowPointSelect: true,
            cursor: 'pointer',
            borderColor: '#d5d5d5',
            dataLabels: {
              enabled: false,
                style: { fontSize: '13px' },
                format: '{point.name}: £{point.y:.2f}'
            },
            showInLegend: true,
            size: 290,
            center: [125,140],

          },
          smallConfig = {
            allowPointSelect: true,
            cursor: 'pointer',
            borderColor: '#d5d5d5',
            shadow:true,
            dataLabels: {
              enabled: false,
                style: { fontSize: '13px' },
                format: '{point.name}: <br /> {point.y:.2f}'
            },
            showInLegend: true,
            valueSuffix: '%'
          },

      backgroundColor = $('body').css('background-color');
      if(backgroundColor == 'transparent') { backgroundColor = '#fff'; }

      this.chart.chart = new Highcharts.Chart({
        colors: [
          '#0b5226',
          '#227e2e',
          '#4fbe42',
          '#a3eb91',
          '#f1fdeb',
          '#04595c',
          '#078578',
          '#44c2b9',
          '#a0ebd9',
          '#f1fffb',
          '#174f80',
          '#037db2',
          '#3cb3e6',
          '#9ddefa',
          '#f1faff',
          '#4f4b8d',
          '#bd1a8d'
        ],
        animation:true,
        chart: {
          type: 'pie',
          backgroundColor: backgroundColor,
          renderTo: renderTo,
          width: width,
          height:330
        },
        title: {
          text: ''
        },
        tooltip: {
          enabled: true,
          headerFormat: '<span style="font-family: Helvetica, Arial, sans-serif;font-size: 16px">{point.key}</span><br/>',
          pointFormat: '<span style="font-family:  Helvetica, Arial, sans-serif;font-size: 14px;font-style: normal;font-variant: normal;font-weight: normal;"><strong>£{point.y:.2f}</strong> <br /> {point.percentage:.0f}%</span>',
          useHTML: true
        },
        legend: {
          align: (windowWidth > thresholdForLarge) ? 'right' : 'center',
          verticalAlign: (windowWidth > thresholdForLarge) ? 'top' : 'bottom',
          y: (windowWidth > thresholdForLarge) ? 50 : 0,
          layout: (windowWidth > thresholdForLarge) ? 'vertical' :'horizontal',
          itemMarginBottom: 20,
          borderWidth: 0,
          labelFormat: '<strong>{name}</strong> £{y:.0f}',
          symbolWidth: 13,
          symbolHeight: 23,
          symbolRadius: 3
        },

        plotOptions: {
          pie: (windowWidth > thresholdForLarge) ? largeConfig : smallConfig
        },
        series: [{
            data: window.chartdata,
            innerSize: '60%',
            events: {
              click: function(e) {
                window.location = e.point.url;
              }
            }
        }],
        credits: {
            enabled: true
        }
      });
    },

    doMoreWithDropdown: {
      init: function init() {
        var $list = $('.DoMoreWithDropdown-list');
        $list.height('42px');
        $list.on('mouseenter', function(e) {
          var $this = $(this), startHeight, endHeight;

          startHeight = $this.height();
          $this.css('height', 'auto');
          endHeight = $this.outerHeight();
          $this.css('height', startHeight + 'px');

          $this.animate({'height': endHeight + 'px'}, 200);
        });
        $list.on('mouseleave', function(e) {
          $(this).stop(true).animate({'height': '42px'}, 200);
        });
      }
    },

    featuretour: function () {
      // See https://github.com/zurb/joyride
      $("#FeatureTour").joyride({
        tipContainer: '.ShortFormBudgetPlanner',
        autoStart: true,
        cookieMonster: true,
        cookieDomain: false,
        cookieName: 'budget_planner_feature_tour',
        cookiePath: '/',
        postRideCallback: function() {
          $(this).joyride('destroy');
        }
      });
    },

    toggleAdditionalSourcesTtitles: function() {
      var $priotirySources = $('.priority li').length,
      $priotirySourcesHidden = $('.priority .js-source-btn--hidden').length,
      $nonPriority = $('.non-priority li').length,
      $nonPriortiyHidden = $('.non-priority .js-source-btn--hidden').length,
      $h4 = $('.SlideToggle h4');
      /// has all sroucrs removed

      if ($priotirySources === $priotirySourcesHidden) {
        $($h4.get(0)).hide();
      } else {
        $($h4.get(0)).show();
      }
      if ($nonPriority === $nonPriortiyHidden) {
        $($h4.get(-1)).hide();
      } else {
        $($h4.get(-1)).show();
      }
    },

    responsive: {
      toggleNav: function($trigger, $list) {
        $trigger.on('click', function(e){
          e.preventDefault();
          $list.slideToggle('fast');
        });
      }
    },

    init: function (parent) {
      var self = this;
      $(parent).each(function initializeShortForm() {
        var $this = $(this),
          $source = $this.find('.Source'),
          $stepInput = $this.find('.StepInput');

        self.frequencyTransform.init($source);
        self.frequencyTransform.init($stepInput);
        self.frequencyTransform.init($this.find('.show-total'));
        self.calculate.init($source, $stepInput);
        self.generateSliders.init($stepInput);
        self.generateSliders.init($source);
        self.slideToggle($this.find('.SlideToggle, .StepInput'), $this.find('.ManageCalculator'), $stepInput);
        self.disableEnableEstimateRegion($this.find('.StepInput .ui-slider'));
        self.clearDefaultValue($this);
        self.chart('piechart', $('.layout-split-end').width());
        self.doMoreWithDropdown.init();
        self.featuretour();
        self.toggleAdditionalSourcesTtitles();
        self.responsive.toggleNav($this.find('.BudgetNavigation-menuToggle'), $('.BudgetNavigation-list'));

        AutoSave.start($this.find('form#edit_budget'), null, $this.find('.StepInput-value, .Amount-input'));
      });
    }
  };

  // starting the short form
  shortForm.init('.ShortFormBudgetPlanner');

}(this, jQuery, utilities));
