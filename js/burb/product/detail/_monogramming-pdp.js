(function($) {

    Ply.ui.define('personalisation_pdp', {

        __init: function() {
            this.events();
            touchInputNav();
            this.objects.promoCellImg = $('.promo-module img');
            this.options.scene7 = $('.promo-module').data('sceneseven');
            this.options.personalisationHiddenInput = $('#personalisation');
            this.options.totalSalePriceContainer = $('.price-sale');
            this.options.totalListPriceContainer = $('.price-amount');
            this.objects.personalisationImage = $('.personalisation-bg-image');
            this.objects.personalisationInput = $('#personalisation-input');
            this.objects.incMonogramming = $('.inc-total');
            this.objects.listPriceTotal = $('.price-amount').text();
            this.objects.salePriceTotal = $('.price-sale').text();
            this.objects.monogrammingListPriceTotal = $('.price-amount').data('monogrammedtotal');
            this.objects.monogrammingSalePriceTotal = $('.price-sale') === undefined ? null : $('.price-sale').data('monogrammedtotal');
            this.personalisationExperience();
            this.configureInput();
        },

        options: {
            maxInput: '3',
            minInput: '1',
            carractersTimeout: 300,
            delays: 400,
            eventsFiered: 0,
            initials: 'AMB'
        },

        __notifications: {
            'personalisation': 'personalisationModal'
        },
            
        __objects: {
            personalisationLink: '.personalisation-link',
            personalisationInput: '#personalisation-input',
            charCount: '#char-count span',
            personalisationImage: '.personalisation-bg-image',
            personalisationError: '.personalisation-error',
            personalisationButton: '.personalisation-button',
            personalisationTextButton: '#personalisation-input-text',
            personalisationTrue: '.personalisation-true',
            personalisationFalse: '.personalisation-false',
            personalisationButtonClear: '.clear-styles-icon',
            personalisationButtonContainer: '.cb-link-container',
            spinnerSelector: '.loaderSpinner'
        },

        events: function() {
            
            var self = this;


            this.objects.personalisationLink.click(function(e) {

                e.preventDefault();
                self.options.scrollPosition = $(document).scrollTop();

                self.personalisationModal();

            });

            this.objects.personalisationButtonClear.click(function(e) {

                    e.preventDefault();
                    self.clearValues();
            });

        },

        // getInt:function(price) {
        //     var number = parseFloat(price.replace( /^\D+/g, ''));
        //     return number;

        // },

        configureInput: function () {
            var userAgent = navigator.userAgent.toLowerCase();

            // Remove placeholder for ipad 5.x
            if ($.browser.ipad && userAgent.match(/version\/5/)) {
                this.objects.personalisationInput.attr('placeholder', '');
            }

        },

        updateTotals: function() {
            this.options.totalListPriceContainer.text(this.objects.monogrammingListPriceTotal);
            if(this.objects.monogrammingSalePriceTotal != null) {
                this.options.totalSalePriceContainer.text(this.objects.monogrammingSalePriceTotal);
            }
            this.objects.incMonogramming.css('display','block');
        },

        revertTotal: function(){
            this.options.totalListPriceContainer.text(this.objects.listPriceTotal);
            if(this.objects.monogrammingSalePriceTotal != null) {
                this.options.totalSalePriceContainer.text(this.objects.salePriceTotal);
            }
            this.objects.incMonogramming.css('display','none');
        },

        showInitials: function() {
            this.objects.personalisationFalse.hide();
            this.objects.personalisationTrue.show();
            this.objects.personalisationButtonClear.show();
        },

        hideInitials: function() {
            this.objects.personalisationFalse.show();
            this.objects.personalisationTrue.hide();
            this.objects.personalisationButtonClear.hide();
        },

        personalisationModal: function(note, sender, data) {
            this.options.scrollPosition = data === undefined ? this.options.scrollPosition : data.scrollPossition;
            this.objects.promoCellImg = data === undefined ? this.objects.promoCellImg : data.personalisationImageCell;
            this.objects.personalisationImage = data === undefined ? this.objects.personalisationImage : data.personalisationImage;
            this.objects.personalisationInput = data === undefined ? this.objects.personalisationInput : data.personalisationInput;
            
            $('html, body').scrollTop(0);
            
            var self = this;
            
            var persModal = $('.modal-personalisation-container').eq(0);

            persModal.show();

            $.modal.open(persModal, {
                extraClasses: 'modal-dark modal-personalisation',
                openSpeed: 0,
                maxHeight: false,
                maxWidth: false,
                fitViewport: false,
                overlayOpacity: 0.7,
                closeText: 'X',
                beforeClose: this.onPopupClose,
                // afterOpen: this.onPopupOpen,
                self:this
            });

            setTimeout(function() {
                self.objects.personalisationInput.focus();
            }, 1000);

            this.setStartupScenarios();

            this.objects.personalisationInput.keydown(function(e) {

                self.personalisationValidator(e);

            });


            this.objects.personalisationInput.keyup(function() {
                var timer;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self.personalisationCount();
                }, self.options.carractersTimeout);
            });

            this.objects.personalisationImage.click(function() {

                self.forceDefaultVal(self.options.initials);

            });

            this.objects.personalisationButton.click(function(e) {

                e.preventDefault();
                self.submitPersonalisation();
                self.updateButton();

            });

            // fixes ie 8 enter stroke
            if ($.browser.msie && $.browser.version === "8.0") {
                this.objects.personalisationInput.keypress(function (e) {
                    if(e.which === 13) {
                        e.preventDefault();
                        self.submitPersonalisation();
                        self.updateButton();
                    }
                });

            }
            
            this.objects.personalisationInput.bind("cut copy paste", function(e) {
                e.preventDefault();
            });

            this.objects.charCount.text(this.objects.personalisationInput.val().length);

        },

        onPopupClose: function() {
            var btnLinkVal = this.self.objects.personalisationTextButton.text();
            $('html, body').animate({
                    scrollTop: this.self.options.scrollPosition
                },
                0
            );
           
            if(btnLinkVal === "") {
                this.self.forceDefaultVal(this.self.options.initials);
            }
        },

        setStartupScenarios: function() {
            var btnLinkVal = this.objects.personalisationTextButton.text(),
                error = this.objects.personalisationError;
            error.css('visibility', 'hidden');
            if (btnLinkVal !== "" && this.options.scene7) {
                var fullUrl = this.setGetParameter(this.objects.personalisationImage.attr('src'), '$initials', btnLinkVal);
                this.objects.personalisationImage.attr('src', fullUrl);
                this.disableBtn(false);
            } else if (btnLinkVal !== "") {
                var input = this.objects.personalisationInput;
                input.val(btnLinkVal);
            } else {
                this.forceDefaultVal(this.options.initials);
            }
        },

        forceDefaultVal: function(val) {
            var fullUrlPopup = this.setGetParameter(this.objects.personalisationImage.attr('src'), '$initials', val),
                fullUrlCell = this.setGetParameter(this.objects.promoCellImg.attr('src'), '$initials', val);
            this.objects.personalisationImage.attr('src', fullUrlPopup);
            this.objects.promoCellImg.attr('src', fullUrlCell);
            this.objects.personalisationInput.val('');
        },

        personalisationValidator: function(e) {
            var max = this.options.maxInput,
                error = this.objects.personalisationError;

            if ((e.which > 64 && e.which < 91) || (e.which > 96 && e.which < 123) || (e.which == 13) || (e.which == 8)) {

                error.css({
                    'visibility': 'hidden'
                });


            } else {

                e.preventDefault();

                error.css({
                    'visibility': 'visible'
                });
            }



            this.objects.personalisationInput.attr('maxlength', max);

            if(this.objects.personalisationInput.val().length > 3) {
                var inputString = this.objects.personalisationInput.val().substring(0, 3);
                this.objects.personalisationInput.val(inputString);
            }

            this.objects.personalisationInput.attr('autocomplete', 'off');

        },

        personalisationCount: function(e) {

            var min = this.options.minInput,
                inputVal = this.objects.personalisationInput.val(),
                $promoCellImg = $('.promo-module img'),
                $personalistionImage = $('.personalisation-bg-image'),
                fullUrlPopup = this.setGetParameter(this.objects.personalisationImage.attr('src'), '$initials', inputVal),
                noParamSrcPopup= this.objects.personalisationImage.attr('src').split('?')[0],
                self = this,
                timer;



            this.objects.charCount.text(this.objects.personalisationInput.val().length);

            if (this.objects.personalisationInput.val().length < min) {
                this.objects.personalisationButton.attr('disabled', 'disabled');
                this.objects.personalisationButtonContainer.removeClass('enabeledBtn');

            } else {
                this.objects.personalisationButton.removeAttr('disabled');
                this.objects.personalisationButtonContainer.addClass('enabeledBtn');
            }


            if (inputVal !== '' && fullUrlPopup != this.objects.personalisationImage.attr('src') && this.options.scene7) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self.objects.spinnerSelector.addClass('spin').show();
                }, this.options.delays);
            }

            this.objects.personalisationImage.load(function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self.objects.spinnerSelector.removeClass('spin').hide();
                }, 200);


            });
            
            if (inputVal !== '' && this.options.scene7) {
                this.objects.personalisationImage.attr('src', fullUrlPopup);
            } else {
                this.objects.personalisationImage.attr('src', noParamSrcPopup+"?wid=1240");
            }

        },

        /// TO MOVE TO UTILITIES
        setGetParameter: function(url, paramName, paramValue) {
            if (url.indexOf(paramName + "=") >= 0) {
                var prefix = url.substring(0, url.indexOf(paramName));
                var suffix = url.substring(url.indexOf(paramName));
                suffix = suffix.substring(suffix.indexOf("=") + 1);
                suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
                url = prefix + paramName + "=" + paramValue + suffix;
            } else {
                if (url.indexOf("?") < 0)
                    url += "?" + paramName + "=" + paramValue;
                else
                    url += "&" + paramName + "=" + paramValue;
            }
            return url;
        },

        submitPersonalisation: function(e) {
            var min = this.options.minInput;
            inputVal = this.objects.personalisationInput.val(),
            fullUrlCell = this.setGetParameter(this.objects.promoCellImg.attr('src'), '$initials', inputVal),
            noParamSrcCell= this.objects.promoCellImg.attr('src').split('?')[0];

            if (this.objects.personalisationInput.val().length >= min) {
                this.objects.personalisationTextButton.html(this.objects.personalisationInput.val());
                this.options.personalisationHiddenInput.val(this.objects.personalisationInput.val());
                this.updateTotals();

                if (inputVal !== '' && this.options.scene7) {
                    this.objects.promoCellImg.attr('src', fullUrlCell);
                } else { 
                    this.objects.promoCellImg.attr('src', noParamSrcCell);
                }
            }
            $.modal.close();
        },
        
        updateButton: function() {
            var min = this.options.minInput,
                self = this;

            if (this.objects.personalisationInput.val().length >= min) {
                this.showInitials();
           }
        },

        personalisationExperience: function() {
            var url = window.location.href;

            if (url.indexOf('?initials') !== -1) {
                this.showInitials();
                this.updateTotals();
                this.objects.personalisationInput.val(this.objects.personalisationTextButton.text());
            }

            if(this.objects.personalisationTextButton.text() == '') {
                this.hideInitials();
                this.revertTotal();
            }
        },

        clearValues: function(e) {
            this.objects.personalisationTrue.hide();
            this.objects.personalisationFalse.show();
            this.objects.personalisationInput.val('');
            this.objects.charCount.text(0);
            this.objects.personalisationTextButton.text('');
            this.objects.personalisationButtonClear.hide();
            this.options.personalisationHiddenInput.val('');
            this.forceDefaultVal(this.options.initials);
            this.revertTotal();
        }

    });


}(jQuery));