/*global Ply, jQuery */
/*jshint eqeqeq: true, curly: true, white: true */

(function($) {

    Ply.ui.define('product_detail_info', {

        options: {
            selectedVariantClass: 'product-variant-selected',
            selectedLinkClass: 'product-info-active',
            availableClass: 'product_detail_info-available',
            unavailableClass: 'product_detail_info-unavailable'
        },

        __init: function() {

            //this.updateOptions();
            this.events();
            this.info();
            this.wishListItems = [];
            //this.checkInWish(); no longer do this onload of the page. have to check in wish after the users wishlist had been retrieved.

            return;
        },

        __notifications: {
            'add-to-cart-error': 'addToWishOrBagError',
            'add-to-wishlist-error': 'addToWishOrBagError',
            'loaded-wish-list': 'retrievedWishlist',
            'rebind-sizes': 'rebindSizeEvents'

        },

        __objects: {
            addToBagLink: '.add-to-bag',
            addToBagForm: '#frmAddToBag',
            editBagLink: '.edit-in-bag',
            editBagForm: '#frmEditItem',
            wishListSkuId: '#wishListSkuId',
            replaceAddQuantity: '#replaceAddQuantity',
            replaceAddSku: '#replaceAddSku',
            colors: '.color-swatch-link',
            colorName: '.color-name',
            infoLinks: '.product-info-link',
            info: '.product-info',
            infos: '.product-info-set',
            sizeoptions: '.sizes .-radio-input',
            sizes: '.sizes',
            sizeoptionOos: '.sizes .sizeoos',
            noSizeSelected: '.error-size',
            accordion: '.ctg-accordion',
            errorGlobal: '.error-global',
            skuId: '#skuId', //only populated when it is a product with no sizes
            quantity: '#frmProduct_ddlQuantity',
            defaultSkuId: '#defaultSkuId', //this is the default sku that is tracked
            shareable: '.share_modal',
            sizeGuide: '.link-size-guide',
            twitterLink: '.product-link-twitter .product-link-a',
            addToWishlistLink: '.add-to-wishlist',
            addToWishlistLinkLogin: '.add-to-wishlist-login',
            addToWishlistForm: '#frmWishList',
            spanHasIcon: '.wishlist-icon',
            wishListButtonText: '.wishlist-button-text',
            emailLink: '.link-email',
            crossSellTitle: '.crosssell .product-title',
            crossSells: '.crosssell',
            recommendedUrl: '.related-product-link',
            purchaseLink: '.link-purchase' // for row
        },

        events: function() {

            var self = this;


            this.selectedColor = this.objects.colorName.text();

            this.objects.addToBagLink.click(function(e) {

                e.preventDefault();

                self.addToBag();

            });

            this.objects.addToWishlistLink.click(function(e) {

                e.preventDefault();

                self.addToWishlist();

            });

            this.objects.addToWishlistLinkLogin.click(function(e) {

                return self.addToWishlistLogin();

            });

            this.objects.editBagLink.click(function(e) {

                e.preventDefault();

                self.editInBag();

            });

            this.bindSizeEvents();

            this.objects.sizeGuide.click(function(e) {

                e.preventDefault();

                self.openSizeGuide();
            });

            this.view.delegate('.needs_twitter_popup', 'click', function(e) {

                Ply.core.notify("product-shared", self, {
                    type: "twitter"
                });

            });


            if (this.objects.crossSellTitle.dotdotdot) {

                this.objects.crossSellTitle.dotdotdot({
                    wrap: 'letter'
                });

            }

            this.objects.recommendedUrl.bind('click', function() {

                this.href = $.param.querystring(this.href, 'recommended=true');

            });

            if (!Modernizr.touch) {

                this.objects.crossSells.bind('mouseenter', function() {
                    $(this).find('.product-details').stop().animate({
                        bottom: '0px'
                    });
                });

                this.objects.crossSells.bind('mouseleave', function() {
                    var obj = $(this).find('.product-details'),
                        newH = -obj.height();
                    $(this).find('.product-details').stop().animate({
                        bottom: newH
                    });
                });

            }


            return;
        },

        bindSizeEvents: function() {

            var self = this;

            this.objects.sizeoptions.bind("change", function() {
                self.checkInWish();

                //have to notify so that detail.js can set the correct URL for email a friend.
                Ply.core.notify("changed-sku", self, {
                    skuId: self.getSelectedSkuId()
                });

                self.error(null);

            });

            this.objects.sizeoptionOos.ctgtooltip({
                fixed: true,
                extraClass: 'sizeOos-error-tooltip',
                text: function() {
                    return self.view.find(".error-sizeoos").html();
                }
            });

        },

        rebindSizeEvents: function() {
            this.__bindObjects('sizeoptions', 'sizeoptionOos');
            this.bindSizeEvents();
        },

        info: function() {

            this.objects.accordion.accordion({
                collapsible: true,
                independent: true,
                active: '#description-panel',
                open: function(e, data) {
                    $.cookie(data.id + '-isopen', true);
                },
                close: function(e, data) {
                    $.cookie(data.id + '-isopen', false);
                }
            });


            return;
        },

        addToBag: function() {
            var self = this,
                skuId = this.getSelectedSkuId(),
                quantity = this.objects.quantity.val();

            this.error(null);
            if (!self.isSizeSelected()) {
                this.error(Ply.res['selectASize'], true);
                return;
            }

            Ply.core.notify("add-item-to-cart", self, {
                formData: self.objects.addToBagForm.atgSerializeArray(),
                skuId: skuId,
                quantity: quantity
            });

            return;
        },

        editInBag: function() {

            var self = this,
                skuId = this.getSelectedSkuId(),
                quantity = this.objects.quantity.val();

            this.error(null);
            if (!self.isSizeSelected()) {
                this.error(Ply.res['selectASize']);
                return;
            }

            this.objects.replaceAddQuantity.val(quantity);
            this.objects.replaceAddSku.val(skuId);

            Ply.core.notify("edit-item-in-cart", self, {
                formData: self.objects.editBagForm.atgSerializeArray(),
                skuId: skuId,
                quantity: quantity,
                previousSkuId: self.delegate.options.skuId,
                previousQuantity: self.delegate.options.quantity
            });

            if (self.delegate && self.delegate.closeQuickbuy) {
                self.delegate.closeQuickbuy();
            }

            return;
        },

        addToWishOrBagError: function(note, sender, data) {

            var errorString = '';

            $.each(data, function(i, error) {

                //hack - as this should probably be description, error.jsp needs to change
                errorString += (error.fieldId + "<br>");
            });

            this.error(errorString);

        },


        addToWishlist: function() {

            var self = this;

            // If not in wish list then add it
            if (!self.checkInWish()) {
                self.objects.sizeoptions.filter(":checked").addClass('inWish');
                self.objects.skuId.addClass('inWish');
                var skuId = this.getSelectedSkuId();

                this.error(null);
                if (!self.isSizeSelected()) {
                    this.error(Ply.res['selectASize']);
                    return;
                }

                this.objects.wishListSkuId.val(skuId);
                this.wishListItems.push(skuId);

                var formData = self.objects.addToWishlistForm.atgSerializeArray();

                var notifyData = {
                    formData: formData,
                    skuId: skuId
                };

                Ply.core.notify("add-item-to-wishlist", self, notifyData);

                self.checkInWish();

                return;
            }
        },

        addToWishlistLogin: function() {

            var self = this,
                skuId = this.getSelectedSkuId();

            this.error(null);

            if (!self.isSizeSelected()) {
                this.error(Ply.res['selectASize']);
                return false;
            } else {
                this.objects.wishListSkuId.val(skuId);
                return true;

            }



        },

        retrievedWishlist: function(note, sender, data) {

            //need to stringify as the array contains numerical values as returned in /views/shared/counter.jsp
            this.wishListItems = this.wishListItems.concat(data.wishlist.join(',').split(','));
            this.checkInWish();

        },


        checkInWish: function() {

            var self = this,
                obj = this.objects.sizeoptions.filter(":checked"),
                selectedSkuId = obj.hasClass('inWish') ? obj.val() : self.objects.skuId.val();



            if ($.inArray(selectedSkuId, this.wishListItems) > -1) {

                this.objects.wishListButtonText.text(Ply.res['inWishlist']);
                this.objects.addToWishlistLink.attr('disabled', 'disabled').removeClass('-button-hasicon');
                this.objects.spanHasIcon.hide();

                return true;

            } else {

                this.objects.wishListButtonText.text(Ply.res['addToWish']);
                this.objects.addToWishlistLink.removeAttr('disabled', 'disabled').addClass('-button-hasicon');
                this.objects.spanHasIcon.show();

                return false;
            }

        },

        isSizeSelected: function() {

            return (this.objects.sizeoptions.length === 0 || this.objects.sizeoptions.is(":checked"));

        },

        getSelectedSkuId: function() {

            if (this.objects.sizeoptions.length > 0) {
                return this.objects.sizeoptions.filter(":checked").val();
            } else {
                return this.objects.skuId.val();
            }

        },


        openHowToPurchase: function() {
            var url = $(this.objects.purchaseLink[0]).attr('href');

            Ply.core.notify('loading-started');

            Ply.ajax.request({
                url: url
            }, function(data) {

                var view = $(data);

                Ply.core.notify('loading-finished', self, {
                    transitionSpeed: 0
                });

                Ply.ui.register('howToPurchase', {
                    modal: {
                        width: 300,
                        fitViewport: false,
                        openSpeed: 0
                    },
                    view: view
                });

            });

            return;
        },

        openSizeGuide: function() {

            var sizeGuideUrl = $(this.objects.sizeGuide[0]).attr('href'),
                self = this;

            Ply.core.notify('loading-started');
            Ply.core.notify("track-size-guide", this, {
                url: sizeGuideUrl,
                units: 'in',
                measuringGuide: ''
            });

            Ply.ajax.request({
                url: sizeGuideUrl
            }, function(data) {

                var view = $(data);

                Ply.core.notify('loading-finished', self, {
                    transitionSpeed: 0
                });

                Ply.ui.register('product_sizeGuide', {
                    modal: {
                        extraClasses: 'modal-sizeguide',
                        fitViewport: true,
                        openSpeed: 0,
                        maxWidth: 700
                    },
                    options: {
                        trackUrl: sizeGuideUrl,
                        locale: self.delegate.options.locale
                    },
                    view: view
                });

            });

            return;
        },

        // generic error message handling (pass in null to clear errors)
        error: function(message, isSizeError) {


            if (message && !isSizeError) {
                this.objects.errorGlobal
                    .find('.error-message')
                    .html(message)
                    .end()
                    .fadeIn();
            } else if (message && isSizeError) {
                this.objects.noSizeSelected
                    .find('.error-message')
                    .html(message)
                    .end()
                    .fadeIn();
            } else {
                this.objects.errorGlobal
                    .find('.error-message')
                    .html('')
                    .end()
                    .hide();
                this.objects.noSizeSelected
                    .find('.error-message')
                    .html('')
                    .end()
                    .hide();
            }

            Ply.core.notify('product_info-error-updated', this);

            return;
        }

    });

}(jQuery));