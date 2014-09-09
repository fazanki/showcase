// view more
// depends: jquery.bbq.js

(function($, undefined) {

    Ply.ui.define('product_split', {

        options: {
            transitionSpeed: $.browser.lteIe6 ? 0 : 500
        },

        __init: function() {
         
            var self = this;

            // we initialise a new view for each shelf product-set (list of products)
            this.objects.categories.each(function () {
                var listingBody = Ply.ui.register('listing-body', {view: $(this).find('.product-set')});
            });

            this.events();

            // because of the dynamic nature of the resize - the product_split category headers are default display none to hide the flash.
            // show the view as soon as all the sizing javascript is run
            this.view.addClass('product-split-show');

            // pass in true to flag silent loading (no loading indicator, animation, or scroll)
            this.checkState(true);

            this.view.lazyload({
                autoDestroy: false,
                transitionSpeed: this.options.transitionSpeed
            });

            if (this.view.hasClass('product_split-filter')) {
                this.splitType = "Merchandise";
            }else {
                this.splitType = "Product";
            }

            //For deep linking to the shelves with id. Example - burberry.com/category/#-id
            //We are prfixing the id with an hyphen to avoid browser hashtag jump
            var fragment = $.param.fragment();
            var id = '#'+fragment.substring(0,fragment.length-5), 
            elToScroll = $(id);
            if(elToScroll[0]){
                window.onload = function() {
                    self.scroll({
                        to: elToScroll.offset().top - self.getHeaderHeight(true) - $('#filterBar').outerHeight()
                    });
                };
            }
        },

        __objects: {
            categories: '.category',
            //toggles: '.category-toggle',
            shelfBanners: '.cell-media-msg',
            //firstProduct: '.product:not(.product-hero):first',
            filterBar: '.product-listing_filterbar',
            trayDescriptions: '.tray-description',
            trayDescriptionsContent: '.tray-description .aspect-inner'
        },

        __notifications: {

            'filtered-listing': 'filterListing',
            'toggle-category': 'toggleCategory',
            'listing-shelf-refresh' : 'refreshShelves'
        },

        refreshShelves : function () {

            this.__bindObjects();
            this.alignTrayDescriptions();

            // the original markup the heritage shelves were bound to, no longer exist.
            // we need to re-initialise the the views and grid functionality for these shelves
            $('.category-row-heritage').each(function () {
                var listingBody = Ply.ui.register('listing-body', {
                        view: $(this).find('.product-set')
                    });
            });

        },

        events: function() {

            var self = this;

            //$('.category-toggle').unbind();
            
            //this.objects.toggles.click(function(e) {
            this.view.delegate('.category-toggle', 'click', function(e) {
                e.preventDefault();

                var category = $(this).parents('.category'),
                    name = category.data('name');

                //note that the category was clicked/interacted with so that this can be tracked for when clicking on a product.
                category.data('clicked',true);
                
                // NOTE: we're not simply removing state from URL on close because it could leave us with location.href + '#' which
                // causes the page to scroll to the top in some browsers - see additional notes:
                // http://benalman.com/code/projects/jquery-bbq/docs/files/jquery-ba-bbq-js.html#jQuery.bbq.removeState
                category.data('isOpen') ? self.pushState(name, false) : self.pushState(name, true);
                
                //this seems to be an extra call? similar call is made below.
                /*if (!category.data('isOpen')){
                    
                    Ply.core.notify("view-more-listing",self,{url:location.pathname + name});
                }*/
            });


            
            this.view.delegate('.product-link', 'click', function () {

                Ply.core.notify('product-list-click', self, this);

            });


            $(window).bind('smartresize.split',function() {

                self.alignTrayDescriptions();
            })
            .bind('resize.split',function() {
                //var windowWidth = self.view.width();

                //self.columnsPerRow = Math.ceil((windowWidth) / self.objects.firstProduct.width());

                self.objects.categories.each(function () {
                    self.validateShowMoreLink($(this));
                });

                // vertical align content in tray-description cells
                // resize product sets before showing category footers
                self.sizeProductSets();

                self.sizeShelfBanners();


            })
            .smartresize()
            .resize();


            return;
        },

        // vertical align content in tray-description cells
        alignTrayDescriptions: function() {
            var self = this;
            this.objects.trayDescriptionsContent.each(function(){
                self.verticalAlignFixNew($(this));
            });
        },

       
        refreshLazyload: function (silent) {
            
            var self = this;
            
            // iPad doesn't refresh lazyload when a category is open on page load,
            // delaying lazyload refresh for touch devices fixes this (perhaps related to DOM freeze on scroll?)
            setTimeout(function () {
                // refresh lazyload, passing in true to ensure we include new images
                self.view.lazyload('refresh', true);
            }, silent && Modernizr && Modernizr.touch ? 2000 : 0);
            
        },
        
        filterListing: function () {

            $(window).unbind('hashchange.split');


        },

        checkState: function (silent) {

            var self = this,
            
                // pass in true to ensure we coerce
                state = $.bbq.getState(true),

                // counts number of open categories
                openCount = 0;
            
            this.objects.categories.each(function (i) {

                var category = $(this),
                    key = category.data('name'),
                    isOpen = category.data('isOpen'),
                    catState = state[key],
                    jumpTo = false;
                
                // cast catState to boolean in case it's not in the hash fragment and therefore undefined
                if (isOpen !== !!catState) {
                    
                    // jump to first 'open' cat in page when silent, if not silent it'll scroll regardless of jumpTo
                    if (silent && openCount === 0) {
                        jumpTo = true;
                    }

                    catState ? self.showMore(category, silent, jumpTo) : self.showLess(category);
                    openCount++;
                }
                
            });
            
            return;
        },
        
        pushState: function (key, value) {
            
            var state = {};
            
            state[key] = value;
            $.bbq.pushState(state);
            
            return;
        },

        toggleCategory: function () {

            this.checkState(false);

            return;
        },

        // silent can be passed in to suppress scrollTo and loading indicator (used when keeping page state on load)
        // pass in jumpTo as true to jump to scroll pos without transition (even when silent)
        showMore: function(category, silent, jumpTo) {

            var self = this,
                products = category.find('.products'),
                productSet = category.find('.product-set'),
                speed = silent ? 0 : self.options.transitionSpeed,
                firstProduct = category.find('.product:not(.product-hero):first'),
                columnsPerRow = Math.ceil((self.view.width()) / firstProduct.width()),
                el;

            Ply.core.notify('listing-view-more',this, {
                category:category.data('name'),
                parentCategory:this.view.data('name'),
                showMore:true, shelfType: self.splitType
            });

            this.getProducts(category, function() {

                var product = productSet.find('.product'),
                productLength = product.length;


                if (category.find('.tray-description').length > 0) {
                    //productLength += 2;

                    // in the case of heritage the tray description will be only 1 column on a 4 column grid
                    if (category.hasClass('category-row-heritage') && columnsPerRow == 4) {
                        productLength += 1;
                    } else {
                        productLength += 2;
                    }
                }

                if (category.find('.product-hero-single').length > 0) {
                    productLength += 1;
                }

                if (category.find('.product-hero-double').length > 0 && columnsPerRow > 4 && !Modernizr.touch) {
                    productLength += 3;
                }

                var productsPerRow = columnsPerRow,
                rows = Math.ceil(productLength/productsPerRow),
                productHeight = firstProduct.height() - 1,
                openHeight = Math.ceil(productHeight) * rows;

                category.addClass('category-is-opening');

                /*console.log('rows = ' + rows);
                console.log('openHeight = ' + openHeight);*/

                productSet
                    .stop()
                    .animate({
                        height: openHeight
                    }, speed, function() {
                    
                        // class not set outside of conditional as it needs to be added after animation 
                        category.addClass('category-is-open');
                        category.removeClass('category-is-opening');
                        products.height('');
                        self.validateShowMoreLink(category);
                      
                        
                    });


                if (jumpTo || !silent) {

                    
                    el = category.offset().top - self.getHeaderHeight(true) - self.objects.filterBar.outerHeight();
                   

                    self.scroll({
                        to: el,
                        speed: speed
                    });
                }
                
                self.updateToggleText(category);
                self.refreshLazyload(silent);
                category.data('isOpen', true);

            }, silent);
            
            return;
        },

        showLess: function(category) {

            var self = this,
                products = category.find('.products'),
                productSet = category.find('.product-set'),
                firstProduct = category.find('.product:not(.product-hero):first'),
                columnsPerRow = Math.ceil((self.view.width()) / firstProduct.width()),
                productsPerRow = columnsPerRow,
                rowCount = Math.ceil(products.length/productsPerRow),
                height = Math.floor((firstProduct.height() -1)* rowCount);

            // if there is a double rowed hero we need to ensure it isn't cropped
            if (productSet.find('.product-hero-double').length > 0 && columnsPerRow !== 4) {
                height = height * 2;
            }

            productSet
                .stop()
                .animate({
                    height: height
                }, this.options.transitionSpeed, function() {
                    category.removeClass('category-is-open');
                    products.height('');
                    self.refreshLazyload();
                });



            var el = productSet.offset().top - self.getHeaderHeight(true) - self.objects.filterBar.outerHeight();
            self.scroll({
                to: el
            });


            Ply.core.notify('listing-view-more',this, {
                category:category.data('name'),
                parentCategory:this.view.data('name'),
                showMore:false, shelfType: self.splitType
            });

                
            this.updateToggleText(category);
            category.data('isOpen', false);
            
            return;
        },
        
        getProducts: function(category, success, silent) {

            var self = this,
                request = {};

            // if is loaded, skip ajax and run success
            if (category.data('isLoaded')) {
                success();
                return;
            }
            
            // don't show loading indicator if silent is passed in
            if (!silent) {
                this.showLoader();
            }
            
            request = {
                url: category.data('url'),
                data: {
                    start: 1,
                    pageSize: 500
                }
            };
            
            Ply.ajax.request(request, function(html) {

                self.hideLoader();
                category.data('isLoaded', true);
                self.appendProducts(category, html);
                success();

            }, function() {

                self.hideLoader();

            });
            
            return;
        },
        
        // get products returns all products in category so we strip out
        // the products already in the DOM
        appendProducts: function(category, html) {
            
            var productCount = category.find('.product:not(.product-hero)').length,
                html = $(html).children('.product').eq(productCount - 1).nextAll();
            
            category.find('.product-set').append(html);
            
            return;
        },

        updateToggleText: function(category) {

            category
                .find('.category-toggle')
                    .toggleClass('category-toggle-open');
            
            return;
        },

        // we need to provide a height for product-sets to set overflow:hidden to hide additional rows
        sizeProductSets: function() {

            var self = this;

            self.objects.categories.each( function() {

                var shelf = $(this);
                var productSet = shelf.find('.product-set');
                var firstProduct = shelf.find('.product:not(.product-hero):first');

                if(!shelf.hasClass('category-is-open')) {

                    if (productSet.find('.product-hero-double').length > 0){

                        productSet.css({
                            'height': Math.floor(firstProduct.height() - 1) * 2
                        });

                    } else {

                        productSet.css({
                            'height': Math.floor(firstProduct.height() - 1)
                        });
                    }
                }

                
            });

        },

        sizeShelfBanners: function() {
            var self = this,
                viewWidth = self.view.width();

            self.objects.shelfBanners.each(function() {
                var $t = $(this),
                    height = (viewWidth * 16 * $t.data('rowspan')) / ( 9  * $t.data('colspan'));

                $t.css('height', Math.ceil(height));
                self.verticalAlignFix($t.children('.cell-media-msg-container').css('display','table'));
            });
        },

        // hides / shows showMore link if products don't fill entire browser width
        validateShowMoreLink: function(category) {

            var self = this,
                firstProduct = category.find('.product:not(.product-hero):first'),
                columnsPerRow = Math.ceil((self.view.width()) / firstProduct.width());

            if (category.find('.product-hero-double').length > 0 && columnsPerRow > 4) {
                category.data('rows',2);
            }
            
            var products = category.find('.product:visible'), // product-hero-image, product-hero-video & product-hero-swf are hidden on touch devices
                productsPerRow = columnsPerRow,
                rowCount = category.data('rows'),
                heroCount = 0,
                footer = category.find('.category-footer');

            // count number of hero cells
            products.each(function() {
                
                var product = $(this);
                
                // product-hero-firstavailable product is reduced to the size of a regular product on touch devices,
                // so just counted as standard image
                if (!Modernizr.touch && product.hasClass('product-hero')) {
                    // if hero is single it takes up an extra 1 space,
                    // if it's double then it takes up an extra 3 spaces
                    heroCount += product.hasClass('product-hero-double') ? 3 : 1;
                }

            });

            if (category.find('.tray-description').length > 0) {
                heroCount += 1;
            }
            

            if (products.length + heroCount > productsPerRow * rowCount) {
                footer.addClass('category-footer-active');
            }
            else {
                footer.removeClass('category-footer-active');
            }
            
            return;
        },

        // not using $.scrollTo as it doesn't always scroll to
        // position passed in due to some odd processing...
        // TODO: callback is currently called twice due to 'body, html' selector, work out cross browser selector
        scroll: function(options) {

            var self = this,
                options = $.extend({
                    element: $('body, html'),
                    to: 0,
                    speed: options.speed || this.options.transitionSpeed,
                    callback: $.noop
                }, options);

            options.element.animate({
                scrollTop: options.to
            }, options.speed, function() {
                options.callback();
            });
            
            return;
        },

        verticalAlignFix : function (cell) {
            cell.css('top', (cell.parent().height() - cell.height()) / 2 );
        },

        // move other code to this version soon
        // vertically aligns content in tray descriptions
        verticalAlignFixNew : function (cell) {
            cell.css('margin-top', -cell.height() / 2);
        },

        __destroy: function (key, value) {
            
            $(window).unbind('.split');
            
            return;
        }


    });

})(jQuery);


