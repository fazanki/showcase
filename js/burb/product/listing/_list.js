// infinite scroll

(function($, undefined) {

    Ply.ui.define('product_list', {

        inRequest: false,
        
        // keeps track of pagination,
        // start at 2 as initial serverside output is page 1
        pageCount: 2,

        options: {
            infiniteScroll: true,
            offset: 100 // determines how far from the bottom of the document we need to be before a request is made
        },

        __init: function() {
            
            this.events();
            
            this.view.lazyload({
                autoDestroy: false,
                transitionSpeed: $.browser.lteIe6 ? 0 : 500
            });

            this.view.delegate('.product-link', 'click', function () {

                Ply.core.notify('product-list-click', self, this);

            });


            
            return;
        },

        __objects: {
            productSet: '.product-set',
            videos: '.product-hero-video',
            swfs: '.product-hero-swf',
            listingBody: '.product-set'
        },

        __partials: {
            listingBody: 'listing-body'
        },

        events: function() {

            var self = this,
                didScroll = false,
                win = $(window),
                doc = $(document);
            
            if (this.options.infiniteScroll) {
            
                // determine if scrolled
                win.bind('scroll.infiniteScroll', function() {
                    didScroll = true;
                });

                // poll to avoid running scroll handler everytime scroll event fires
                this.interval = setInterval(function() {

                    if (didScroll) {
                        didScroll = false;

                        if (!self.inRequest && win.scrollTop() + win.height() >= doc.height() - self.options.offset) {
                        
                            self.inRequest = true;
                            self.getProducts(function() {
                                self.inRequest = false;
                            });
                        }

                    }
                    
                }, 300);
            
            }



            
            return;
        },
        
        // unfortuantely ATG requires us to use location.href to get products,
        // this includes a bucket load of query params which means, in order to update the
        // start param, we need to parse the query params and then update start
        getRequestObj: function () {

            var categoryUrl,
            state = $.bbq.getState(true),
            url = state['url'];


            if (!!url) {
                categoryUrl = url;
            }else {
                categoryUrl = location.pathName;
            }
        
            var request = {
                url: categoryUrl,
                data: $.deparam.querystring()
            };
            
            request.data.start = this.pageCount;
            //request.data.redirect = false;
            
            return request;
        },
        
        // makes ajax request for next page of products
        getProducts: function(complete) {
        
            var self = this,
                complete = complete || $.noop;
            
            this.showLoader();
            
            Ply.ajax.request(this.getRequestObj(), function (html, textStatus, xhr) {
                    
                self.hideLoader();
                
                if (!html || ($.trim(html).length === 0)) {
                    self.destroyInfiniteScroll();
                    return;
                }
                
                self.appendProducts(html);
                self.view.lazyload('refresh', true); // refresh lazyload, passing in true to ensure we include new images
                self.pageCount++;
                complete();
                
            }, function () {
            
                self.hideLoader();
                complete();
            
            });

            return;
        },


        
        // appends html to productSet
        appendProducts: function (html) {
            
            this.objects.productSet.append($(html).html());
            //need to rebind the objects in the partial and trigger resize so that products are sized correctly
            this.partials.listingBody.__bindObjects();
            this.window.resize();
            return;
            
        },
        
        destroyInfiniteScroll: function () {
            
            $(window).unbind('scroll.infiniteScroll');
            clearInterval(this.interval);
            
            return;
        },

        __destroy : function () {

            $(window).unbind('.list');

        }



    });

})(jQuery);