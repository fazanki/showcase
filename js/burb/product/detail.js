(function($, undefined) {

    Ply.ui.define('productDetail', {

        // cache views for quick subsequent retrievals
        cache: {},

        options: {
            viewerVersion: 'product_viewer'
        },

        __init: function() {

            var self = this;

            this.events();
            this.tmpls();

            if (self.options.locale == "JP" || self.options.locale == "CN") {
                this.wrap = "letter";
            } else {
                this.wrap = "word";
            }

            // update view height once font has been loaded as it
            // affects height of sidebar - #9694
            if (Modernizr.fontface) {
                $.fontLoad('BurberryCapitalsSmallRegular', this, function() {
                    self.updateViewHeight();

                    //this is for the ellipsis. ideally gets removed later. also needs;
                    self.objects.productTitleWrapper.dotdotdot({
                        watch: true,
                        wrap: this.wrap
                    });
                    //need to set productTitle because of jquery.dotdotdot removing the initial from the dom
                    self.objects.productTitle = self.view.find('.product-title');
                    self.centerTitleCopy();


                });
            }

            // clear cache every 15mins
            setInterval(function() {
                self.clearCache();
            }, 1000 * 60 * 15);


            return;
        },

        __objects: {
            viewer: '.product_viewer',
            container: '.product_detail_container',
            info: '.product_detail_info',
            colorSet: '.color-set',
            sizeoptions: '.sizes .-radio-input',
            defaultSkuId: '#defaultSkuId',
            personalAssistance: '.communications',
            productHeader: '.product-hd',
            productTitleWrapper: '.product-title-wrapper',
            productLinks: '.product-titlebar .preview-link',
            productTitle: '.product-title',
            emailLink: '.product-hd .link-email',
            personalisationLink: '.personalisation-link-cell',
            personalisationImage: '.personalisation-bg-image',
            personalisationImageCell: '.promo-module img',
            personalisationInput: '#personalisation-input'
        },

        __partials: {
            viewer: 'product_viewer',
            info: 'product_detail_info'
        },

        __notifications: {
            'changed-sku': 'selectedSku'
        },

        // cache templates
        tmpls: function() {

            this.templates = {
                thumbnail: $('#thumbnail-tooltip-tmpl')
            };

            return;
        },

        events: function() {

            var self = this,
                win = $(window),
                currheight,
                currwidth,
                resizeTimeout;

            this.objects.personalisationLink.click(function(e){
                e.preventDefault();
            
                Ply.core.notify("personalisation", this, {
                    scrollPossition: $(document).scrollTop(),
                    personalisationImage: self.objects.personalisationImage,
                    personalisationImageCell: self.objects.personalisationImageCell,
                    personalisationInput: self.objects.personalisationInput
                });
            });

            this.objects.colorSet.delegate('a', 'click', function(e) {
                e.preventDefault();

                if ($(this).parent(".color").hasClass("color-selected")) {
                    return;
                }

                self.getView($(this).data("colorLink"));
            });

            this.view.delegate('.newvoice-call', 'click', function(e) {

                Ply.core.notify('open-click-to-call-chat', this, {
                    type: 'productCall'
                });


            });

            this.view.delegate('.liveagent-chat', 'click', function(e) {

                Ply.core.notify('open-click-to-call-chat', this, {
                    type: 'productChat'
                });

            });

            this.view
                .delegate('.product-titlebar a.preview-link', 'mouseenter', function() {
                    self.showTooltip($(this).data('isHovered', true));
                })
                .delegate('.product-titlebar a.preview-link', 'mouseleave', function() {
                    self.hideTooltip($(this).data('isHovered', false));
                });

            win.bind('resize.productDetail', function() {

                // <=IE8 fire resize event twice (once when window is resized and again when body is resized)
                // here we check that the window has actually changed dim
                if ($.browser.lteIe8) {

                    if (currheight != win.height() || currwidth != win.width()) {
                        clearTimeout(resizeTimeout);
                        resizeTimeout = setTimeout(function() {
                            self.updateViewHeight();
                        }, 10);
                    }

                    currheight = win.height();
                    currwidth = win.width();

                } else {
                    self.updateViewHeight();
                }


            })
                .trigger('resize.productDetail');



            return;
        },

        getView: function(productUrl) {

            var self = this;

            this.assistanceLinks = this.objects.personalAssistance.html();

            // if response has been cached
            if (this.cache[productUrl]) {

                this.updateView(this.cache[productUrl]);

                return;
            }

            this.showLoader();

            Ply.ajax.request({
                url: productUrl,
                type: 'GET'
            }, function(html, textStatus, xhr) {

                self.hideLoader();

                // if all content has been returned the server should return a 204 (NOTE: IE sometimes reports this as 1223)
                if (xhr.status === 204 || xhr.status === 1223) {
                    return;
                }

                self.cache[productUrl] = html;

                self.updateView(html);

            }, function() {

                self.hideLoader();

            });


            return;
        },

        // update view with html
        updateView: function(html) {

            // IE has problems with .html() and is breaking CRM content so use this instead
            // http://stackoverflow.com/questions/412734/jquery-html-attribute-not-working-in-ie
            this.objects.container.empty().append(html);

            this.refreshView();
            this.objects.personalAssistance.html(this.assistanceLinks);

            return;
        },

        // refreshes view after replacing html with new content
        refreshView: function() {

            var self = this,
                defaultSkuId = this.objects.defaultSkuId.val(); //retrieved to be passed to analytics

            this.__bindObjects();
            this.__bindPartials();
            this.__init();

            // notify forms need updating
            Ply.core.notify('update-forms', this.view);


            if (window.Crm && Crm.onPageChange) {
                Crm.onPageChange();
            }
            
           
            return;
        },

        clearCache: function() {

            this.cache = {};

            return;
        },

        updateViewHeight: function() {

            // unable to get 100% height on .product_viewer and .product_detail_info working in IE6,
            // so bg color is instead set to that of the .product_detail_info container
            if ($.browser.lteIe6) {
                return;
            }

            this.view.height('');

            var self = this,
                docHeight = $(document).height(),
                headerHeight = this.getHeaderHeight();

            this.view.height(docHeight - headerHeight);

            return;
        },

        centerTitleCopy: function() {

            // Modernizr not correctly testing for display: table so browser sniffing for now... !Modernizr.displaytable
            if ($.browser.lteIe7) {

                var copyHeight = this.objects.productTitle.height(),
                    containerHeight = this.objects.productHeader.height(),
                    pos = (containerHeight - copyHeight) / 2;

                this.objects.productTitle.css('top', pos);

            }

            return;
        },

        selectedSku: function(note, sender, data) {

            var self = this;

            if (self.objects.emailLink[0]) {

                var elink = $(self.objects.emailLink[0]),
                    productUrl = $.param.querystring(elink.data('link'), {
                        skuId: data.skuId
                    });

                elink.data('link', productUrl);

            }

        },

        showTooltip: function(el) {

            var self = this;

            if (Modernizr.touch || !el.length) {
                return;
            }

            if (!el.data('tooltipsy')) {

                el.tooltipsy({
                    className: 'tooltipsy-1 tooltipsy-product_detail-preview',
                    show: function(e, tip) {
                        // have to manually position
                        var topPosition = el.offset().top + el.outerHeight() + 8,
                            //lastButton is the one furthest to the right.
                            //could be next or previous if we are the first in the category or last in the category (next or previous button is not shown)
                            lastButton = self.objects.productLinks.first(),
                            leftPosition = lastButton.offset().left + lastButton.outerWidth() - tip.outerWidth();

                        if (self.objects.productLinks.length == 1) {
                            tip.addClass('has-arrow-right-side');
                        } else if (el.hasClass('previous-button')) {
                            tip.addClass('has-arrow-left-side');
                        } else if (el.hasClass('next-button')) {
                            tip.addClass('has-arrow-right-side');
                        }


                        tip.css({
                            top: topPosition,
                            left: leftPosition
                        })
                            .show()
                            .find('.product-title').dotdotdot({
                                wrap: self.wrap
                            });

                    },
                    hide: function(e, tip) {
                        tip.hide();
                    },
                    content: function(el, tip) {
                        var templateOptions = {
                            thumbSource: el.data('thumbSrc'),
                            productTitle: el.data('productTitle')
                        };
                        return self.templates.thumbnail.tmpl(templateOptions)[0];
                    },
                    dynamicContent: true,
                    showEvent: null,
                    hideEvent: null
                });

            }

            el.data('tooltipsy').show();

            return;
        },

        hideTooltip: function(el) {

            if (el.length && el.data('tooltipsy')) {
                el.data('tooltipsy').hide();
            }

            return;
        }

    });

})(jQuery);