(function($, undefined) {

    Ply.ui.define('listing-body', {

        options: {
            view: this.view,
            transitionSpeed: $.browser.lteIe6 ? 0 : 500
        },

        __init: function() {
           
            this.events();
            this.embedVideos();
            this.embedSwfs();
            
            return;
        },

        events: function() {

            var self = this;

            // every time this view is created it is binding another resize event to the window object
            // even when Ply automatically removes the view, this event still remains
            // as heritage shelves are created and destroyed these events are appended to window object
            // creating a situation where dozens of resize events are called
            // this may or may not be a serious issue causing a memory leak?

            // this event now fires a notification rather than the methods themselves
            // this is to try and mitigate the amount of code triggered by orphaned events
            $(window).resize(function() {
                Ply.core.notify('resize-shelf', self, this);
                //console.log('notification');
            }).resize();
        },
        
        __objects: {
            view: this.view,
            products: '.product:not(.product-hero)',
            firstProduct: '.product:not(.product-hero):first',
            trayDescription: '.tray-description',
            productImages: '.product:not(.product-hero) img',
            videos: '.product-hero-video',
            swfs: '.product-hero-swf'
        },

        __notifications: {
            'listing-shelf-refresh' : 'refreshShelves',
            'resize-shelf' : 'resize'
        },

        resize: function() {
            this.setViewWidth();
            this.reorderProducts();
        },

        refreshShelves : function () {
            this.__bindObjects();
        },
        
        onLazyLoad : function (image){
            var parent = image.parent();
            parent.addClass('cell-loaded');
            return;
        },

        //sets the width of the view to make divisible by 4/6/8 to remove rounding errors.
        setViewWidth: function (e) {

            var self = this,
            windowWidth = self.window.width(),
            documentWidth = self.document.width(),
            newWidth;

            if (windowWidth <= 1024) {
                this.columnsPerRow = 4;
            }
            else if (windowWidth <= 1280) {
                this.columnsPerRow = 6;
            }
            else {
                this.columnsPerRow = 8;
            }

     

            //window - sidebar... using view.width() was giving inconsistent results, need to investigate why
            if ($.browser.lteIe6) {
                newWidth =  Math.floor((windowWidth - 169 + this.columnsPerRow/2) / this.columnsPerRow) * this.columnsPerRow - this.columnsPerRow;
            } else {
                newWidth =  Math.ceil((documentWidth - 169 + this.columnsPerRow/2) / this.columnsPerRow) * this.columnsPerRow;
            }

            self.view.width(newWidth);


            return;
        },

        // we need to reorder the products to allow hero cells to be left or right aligned
        // hero cells and tray descriptions are re-sized relative to regular product cells
        reorderProducts: function() {

            var self = this;

            // re-order product list based on aligned hero and columns
            var $productSet = this.view;
            var $hero = 0;
            var $heroDouble = $productSet.find('.product-hero-double');
            var $heroSingle = $productSet.find('.product-hero-single');
            var $serviceCell = $productSet.find('.tray-description'),
            cellWidth = self.objects.firstProduct.width(),
            cellHeight = Math.floor(cellWidth * 16 / 9),//have to calculate height instead of grabbing height from the product. assume this is because height has not been calculated by browser yet?
            heroHeight = (self.columnsPerRow !== 4) ? (cellHeight * 2) : cellHeight;

            if($heroDouble.length >= 1) {
                $hero = $heroDouble;
            }
            else if ($heroSingle.length >= 1) {
                $hero = $heroSingle;
            }

            $heroSingle.height(cellHeight);

            /*console.log('products = ' + this.objects.products.length);
            console.log('cellWidth = ' + cellWidth);
            console.log('cellHeight = ' + cellHeight);*/

            //console.log('reorderProducts()');
            
            // resizing hero and tray descriptions based on regular cells
            if (Modernizr.touch) {
                $heroSingle.width(cellWidth * 2);
                $heroDouble.width(cellWidth);
                $serviceCell.height(cellHeight + 147);
            }else {
                $serviceCell.height(cellHeight);
                $heroDouble.height(heroHeight);
                self.objects.products.height(cellHeight); //this has to be done for ie6
            }

            // re-ordering hero cells to allow correct alignment
            if ($hero.length >= 1) {

                var currentIndex = $hero.index();
                
                // re-order products if hero right aligned
                if($hero.hasClass('hero-right')) {

                    if(currentIndex !== 1) { //position 0 is taken by tray description

                        var html = $hero.clone(true);
                        var products = $productSet.find('.product');

                        $hero.detach();
                        html.insertAfter(products.eq(0));

                    }

                }
            }
        },

        embedVideos: function() {

            var self = this,
                options = this.options;

            this.objects.videos.each(function() {

                var el = $(this),
                    id = this.id + '-video-container',
                    videoSrc = el.data('videoSrc'),
                    flashvars = {
                        videoUrl: videoSrc,
                        targetUrl: el.find('.product-link')[0].href
                    };

                swfobject.embedSWF(options.playerUrl, id, '100%', '100%', '9.0.0', null, flashvars, options.swf.params, options.swf.attributes, function() {
                    el.addClass('product-video-isembedded');
                });

            })
            .swfEvents(this.options.swfEventMap);
            
            return;
        },
        
        embedSwfs: function() {

            var options = this.options.swf;

            this.objects.swfs.each(function() {

                var el = $(this),
                    id = this.id + '-swf-container',
                    swfSrc = el.data('swfSrc'),
                    flashvars = {
                        targetUrl: el.find('.product-link')[0].href
                    };

                swfobject.embedSWF(swfSrc, id, '100%', '100%', '9.0.0', null, flashvars, options.params, options.attributes);

            });

            return;
        }



    });

})(jQuery);