(function($) {

    Ply.ui.define('product_viewer', {

        options: {
            transitionSpeed: 500,
            aspect: 1.776859504132231,
            playerUrl: '/swf/productPlayer_v4.swf'
        },

        __init: function() {

            var self = this;


            this.cacheObjects();
            this.events();


            // image are hidden by default in CSS, fade them in once they've all loaded
            this.view.imageLoad(function() {

                // view height needs updating once all images have loaded as
                // _viewer height is, not ideally, deteremined by assets.
                self.delegate.updateViewHeight();

                self.view.animate({
                    opacity: 1
                }, self.options.transitionSpeed);
            });

            this.embedVideos();
            // this.updateCells();

            return;
        },

        __objects: {
            productMediaSet: '.product-media-set',
            productImage: '.product-image',
            productVideo: '.product-video',
            media: '.product-media-set li' 
        },

        __notifications: {

            'refresh-pdp-media': 'repopulateCells'
        },

        // cache additional objects
        cacheObjects: function() {
            this.objects.media = $('.product-media-set li');
            this.objects.mediaOverlay = this.objects.media.find('.overlay');
            this.objects.productPromotional = this.objects.productMediaSet.find('.product-promotional');
            this.objects.imageAnnotations = this.view.find('.product-annotated-image .overlay p');
        },

        // see tin
        events: function() {

            var self = this;

            $(window).bind('resize.product_viewer', function() {
                self.updateDimensions();
            })
                .trigger('resize.product_viewer');

            this.view
                .delegate('.product-image', 'click', function() {
                    self.zoomIn($(this));
                })
                .delegate('.product-image-clone', 'click', function() {
                    self.zoomOut($(this));
                });

            // make whole of cell clickable
            this.view
                .delegate('.product-promotional-outer', 'click', function() {
                    var url = $(this).find('a').attr('href');
                    window.location.href = url;
                });

            // make whole of cell mouseover
            this.view
                .delegate('.product-promotional', 'mouseover', function() {
                    $(this).addClass('hover');
                });

            // make whole of cell mouseout
            this.view
                .delegate('.product-promotional', 'mouseout', function() {
                    $(this).removeClass('hover');
                });

            return;
        },
        
        embedVideos: function() {
        
            if (swfobject.hasFlashPlayerVersion('9.0.0')) {
                
                var self = this,
                    options = this.options.swf;

                this.objects.productVideo.each(function() {

                    var el = $(this),
                        id = this.id + '-video-container',
                        videoSrc = el.data('videoSrc'),
                        flashvars = {
                            videoUrl: videoSrc,
                            autoPlay: false
                        };

                    swfobject.embedSWF(self.options.playerUrl, id, '100%', '100%', '9.0.0', null, flashvars, options.params, options.attributes);

                });

            } else {

                // html5 video controls
                this.objects.productVideo
                    .find('video')
                    .videoControls({
                        playText: Ply.res['play'],
                        pauseText: Ply.res['pause'],
                        showControlsEvent: Modernizr.touch ? 'touchstart' : 'click'
                    });
                    
            }
            
            return;
        },

        // zooms in image
        zoomIn: function(image) {

             Ply.core.notify('product-zoom', this, {
                zoomIn: true
            });

            var self = this,
                speed = Modernizr.touch ? 0 : this.options.transitionSpeed, // #9605
                scrollTop = $(window).scrollTop(), // get scroll pos to then revert back to on zoom out
                zoomedSrc = image.data('zoomedSrc'),
                img = image.find('img'),
                clone = $('<img />')
                    .addClass(img[0].className + ' product-image-clone')
                    .insertAfter(this.objects.productMediaSet)
                    .data('scrollTop', scrollTop)
                    .one('load', function() {

                        self.view.addClass('product_viewer-is-zoomed product_viewer-in-transition');
                        
                        $(this)
                            .animate({
                                opacity: 1
                            }, speed, function() {
                                clone.attr('src', zoomedSrc);
                                self.view.removeClass('product_viewer-in-transition');
                            });

                        self.delegate.updateViewHeight();

                    })
                // src needs to be added after load is bound
                .attr('src', img[0].src);

            $('html, body').scrollTop(0);

            return;
        },

        // zoom out clone image
        zoomOut: function(clone) {

            if (!clone.hasClass('product-image-clone')) {
                return;
            }

            Ply.core.notify('product-zoom', this, {
                zoomIn: false
            });

            var self = this,
                scrollTop = clone.data('scrollTop');
            
            this.view.removeClass('product_viewer-is-zoomed');
            clone.remove();
            this.delegate.updateViewHeight();

            $('html, body').scrollTop(scrollTop);

            return;
        },

        // dynamically repopulate cells from JavaScript object
        repopulateCells: function(notification, scope, productData) {

            var productMediaSet = this.objects.productMediaSet;

            // remove existing cells
            productMediaSet.empty();

            // reset and remove any existing zoomed images
            $('.product_viewer').removeClass('product_viewer-is-zoomed');
            $('.product-image-clone').remove();

            // update page header
            $('.product-title-container h1').text(productData.xlate);

            // loop through image cells creating markup
            for (var i = 0; i < productData.images.length; i++) {

                var cell = productData.images[i];
                var html;

                if (cell.type == 'Video') {

                    html =  '<li class="product-video" id="product-video-' + (i+1) + '" data-video-src="' + cell.url + '_486x864.mp4">' +
                                '<div id="product-video-' + (i+1) + '-video-container">' +
                                    '<video src="' + cell.url + '_486x864.mp4" loop="loop" width="100%" height="100%" poster="' + cell.posterFrame + '_poster?$prod_poster$">' +
                                        '<source src="' + cell.url + '_486x864.mp4" type="video/mp4" />' +
                                    '</video>' +
                                '</div>' +

                                '<img src="' + cell.posterFrame + '_poster?$prod_poster$" alt="' + cell.name + '" class="product-poster-frame" />' +

                            '</li>';

                }
                // if image has a caption create cell with caption
                else if (cell.caption != "") {

                    html = '<li class="product-annotated-image">' +
                            '<img alt="' + cell.name + '" src="' + cell.url + '?$prod_main$">' +
                            '<div class="overlay"></div>' +
                            '<div class="product-outer">' +
                               '<div class="product-inner">' +
                                   '<p>' + cell.caption + '</p>' +
                               '</div>' +
                            '</div>' +
                        '</li>';


                } else {

                    html = '<li class="product-image" data-zoomed-src="' + cell.url + '?$prod_zoom$">' +
                                '<img alt="' + cell.name + '" src="' + cell.url + '?$prod_main$">' +
                                '<span class="zoom-icon"></span>' +
                            '</li>';
                }

                productMediaSet.append(html);

            }

            // loop through additional media cells
            for (var i = 0; i < productData.productCellList.length; i++) {

                var cell = productData.productCellList[i];
                var html;

                // if has copy create promotional cell
                if (cell.links.length > 0) {

                    var links = cell.links[0];

                    html = '<li class="product-experience">' +
                                '<img alt="' + cell.cellLinksTitle + '" src="' + cell.url + '?$prod_main$">' +
                                '<div class="overlay"></div>' +
                                '<div class="product-outer">' +
                                   '<div class="product-inner">' +
                                       '<h3>' + cell.cellLinksTitle + '</h3>' +
                                       '<div class="cb-link-container">' +
                                           '<div class="cb-link-bg">&nbsp</div>' +
                                           '<a class="label" href="' + links.url + '">' + links.copy + '</a>' +
                                       '</div>' +
                                   '</div>' +
                               '</div>' +
                            '</li>';

                } else {

                    html = '<li class="product-promotional">' + 
                                '<img alt="' + cell.copy + '" src="' + cell.url + '?$prod_main$">' +
                                '<div class="overlay"></div>' +
                                '<div class="product-outer">' +
                                    '<div class="product-inner">' +
                                        '<h3>' + cell.copy + '</h3>' +
                                        '<div class="divider"><!-- --></div>' +
                                        '<p>' + cell.heading + '</p>' +
                                    '</div>' +
                                '</div>' +
                                '<a href="' + cell.targetURL + '" target="_blank" class="-overlay-link"></a>' +
                            '</li>';

                }

                productMediaSet.append(html);

            }

            // rebuild functionality and layout for replacement cells
            this.__bindObjects();
            this.cacheObjects();
            this.updateDimensions();
            this.embedVideos();
            this.updateDetails(productData);

        },

        updateDetails: function(data) {
            this.objects.descriptionBlock = this.objects.descriptionBlock || $('.product-info-content');
            
            var description = data.description,
                features = data.features,
                descriptionContainer =this.objects.descriptionBlock.eq(0), 
                featuresContainer = this.objects.descriptionBlock.eq(1);

            descriptionContainer.html(description);
            featuresContainer.html(features);
        },

        updateDimensions: function() {

            var self = this,
                height = Math.floor(self.objects.media.eq(0).width() * self.options.aspect);

            this.objects.media.each(function() {

                $t = $(this);
                $t.height(height);
                var inner = $t.find('.product-inner');
                self.vAlignMiddle(inner);
            });

            this.objects.imageAnnotations.each(function() {
                self.vAlignMiddle($(this));
            })

            return;
        },

        vAlignMiddle: function($el) {
            $el.css({
                'margin-top': ($el.parent().height() - $el.height()) / 2
            })
        }
    });

})(jQuery);