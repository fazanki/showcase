
(function($, undefined) {

    Ply.ui.define('productListing', {

        options: {
            type: 'split', // or list
            isFestive: false
        },

        cache: {},
        currentUrlState: null,

        // regex used to parse out any script tags within hijaxed content
        rscript: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,

        __init: function() {

            var self = this;

            //cache the initial product split view html so that we can re-initialize the view when user goes back in their
            //browser history
            self.cache['product_split'] = self.objects.split.clone()[0];

            this.embedHeroSwf();
            this.centerHeroCopy();
            this.bindPartials();


            // clear cache every 15mins
            setInterval(function() {
                self.clearCache();
            }, 1000 * 60 * 15);

            $(window).bind('smartresize',function() {
                self.sizeBannerHero();

            })
            .bind('hashchange', function () {
                self.checkState();
            })
            .smartresize();

            this.checkState();

            this.view.lazyload({
                autoDestroy: false,
                transitionSpeed: $.browser.lteIe6 ? 0 : 500
            });



        },

        __objects: {
            split: '#product_split',
            list: '#product_list',
            filterbar: '.product-listing_filterbar',
            cellBannerHero: '.banner-hero .cell-media-msg',
            hero: '.hero',
            serviceCells: '.service-cell-set',
            shareLinks: '.-titlebar-share-menu-item a'
        },

        __partials: {
            filterbar: 'listing_filterbar'
        },

        __notifications: {
            'filtered-listing':'filteredListing'
        },


        bindPartials: function() {

            switch (this.options.type){

            case 'list':
                Ply.ui.register('product_list', {
                    view: this.objects.list,
                    options: this.options,
                    delegate: this.view
                });

                break;

            case 'split':
                Ply.ui.register('product_split', {
                    view: this.objects.split,
                    options: this.options,
                    delegate: this.view
                });

                break;

            default:

                // do nothing

            }

            return;
        },

        
        // NOTE: refers to top landscape hero
        embedHeroSwf: function() {
                
            if (this.objects.hero.hasClass('hero-swf')) {
                
                var self = this,
                    options = this.options.swf,
                    el = this.objects.hero,
                    id = el[0].id + '-swf-container',
                    swfSrc = el.data('swfSrc');
                
                swfobject.embedSWF(swfSrc, id, '100%', '100%', '9.0.0', null, null, options.params, options.attributes, function() {
                    el.addClass('hero-swf-isembedded');
                });
                
            }
            
            return;
        },
        
        // NOTE: refers to top landscape hero
        // vertically align variable height hero text (when browser doesn't support display:table support)
        centerHeroCopy: function () {
            
            // Modernizr not correctly testing for display: table so browser sniffing for now... !Modernizr.displaytable
            if ($.browser.lteIe7 && this.objects.hero.hasClass('hero-hascopy')) {
                
                var copy = this.objects.hero.find('.hero-copy'),
                    copyHeight = copy.height(),
                    heroHeight = this.objects.hero.height(),
                    pos = (heroHeight - copyHeight) / 2;
                    
                copy.css('top', pos);
            
            }
            
            return;
        },
        
        getCategory: function (categoryUrl) {
        
            var self = this;

   
            self.showLoader();

                
                Ply.ajax.request({
                    url: categoryUrl
                        + "?festive=true"  //add param so that the .jsp knows to return full view and not just the 'ajax' partial view
                        + "&redirect=false" // add param to prevent backend redirecting requests from users on site (shared links only)
                }, function (data) {


                    self.setShareLinks(categoryUrl);
                    self.hideLoader();

                    Ply.core.notify('loaded-category',self, {categoryUrl:categoryUrl});
               

                    // parse out any scripts and get #product_list html content
                    var content = $("<div />")
                        .append(data.replace(self.rscript, '')),
                        productList = content.find('#product_list'),
                        productSplit = content.find('#product_split'),
                        sharedSidebar = content.find('.shared_sidebar'),
                        serviceCells = content.find('.service-cell-set');

                    self.options.type = productSplit.length > 0 ? 'split' : 'list';

                     //if there is no product_list then we know that the ajax call was for a product_split page
                    content = self.options.type === 'list' ? productList[0] : productSplit[0];

                    if (!content){
                        //retrieved a wrong URL and just replace with original view...
                        content = self.cache['product_split'];

                    }else {

                        Ply.core.notify('refresh-sidebar', this, {content: sharedSidebar});

                    }

                    self.replaceView(content, serviceCells);

                    

                    $('body, html').scrollTop(0);

                }, function () {

                    self.hideLoader();

                });

        
            return;
        },

        setShareLinks: function (categoryUrl) {

            var self = this;

            self.objects.shareLinks.each(function () {

                var linkUrl = $(this)[0].href,
                locale = $(this).data('locale'),
                paramObj = $.deparam.querystring(linkUrl);


                if (paramObj.url !== undefined) {
                    paramObj.url = $.param.querystring('http://' + window.location.hostname + categoryUrl,"locale="+locale);
                }else {
                    paramObj.u = $.param.querystring('http://' + window.location.hostname + categoryUrl,"locale="+locale);
                }
                
                $(this)[0].href = $.param.querystring(linkUrl,paramObj);

            });
        },

        replaceView: function (content, serviceCells) {

            var self = this;
            

            //replace the original 'product_split' from page load with the new listing content OR replace the old listing content with new listing content.
            if (self.objects.split.length > 0){

                self.objects.split.replaceWith(content);

                

            }else {

                self.objects.list.replaceWith(content);

            }

            self.__bindObjects();
            self.bindPartials();


            if (self.options.type === 'list'){
                self.objects.serviceCells.remove();
            } else {
                self.objects.split.append(serviceCells);
            }



        },

        clearCache: function() {

            this.cache = {};

            return;
        },

        sizeBannerHero: function() {
            var self = this,
                viewWidth = self.view.width(),

                height = (viewWidth * 16 * self.objects.cellBannerHero.data('rowspan')) / ( 9  * self.objects.cellBannerHero.data('colspan'));

            self.objects.cellBannerHero.css('height', Math.ceil(height));
            self.verticalAlignFix(self.objects.cellBannerHero.children('.cell-media-msg-container').css('display','table'));
            
        },

        verticalAlignFix : function (cell) {
            cell.css('top', (cell.parent().height() - cell.height()) / 2 );
        },


        
        //if on view initializing do not replace the view as it is unneccesary to replace the view with itself.
        checkState: function () {
            
            var self = this,
            state = $.bbq.getState(true),
            url = state['url'],
            content,
            isCat = $.param.fragment().indexOf('cat') > -1; //do as regex later.

            //if url in hash changes, need to grab url value and ajax in content
            if ((url && url.length > 0) && isCat) {
                if (url === self.previousUrl) {
                    Ply.core.notify('toggle-category');
                }else {
                    self.getCategory(url);
                }
            } else if (url && url.length > 0) {
                if (url === self.previousUrl) {
                     Ply.core.notify('toggle-category');
                } else {
                    self.getCategory(url);
                }
            }  else if (!isCat && (url === undefined)) {

                if (self.previousUrl !== undefined && self.previousCatExisted) {

                    self.options.type = "split";
                    content = self.cache['product_split'];
                    self.replaceView(content);
                    Ply.core.notify('loaded-category',self, {categoryUrl:''});
                    $(window).smartresize();


                } else if (self.previousUrl !== undefined) {

                    self.options.type = "split";
                    content = self.cache['product_split'];
                    self.replaceView(content);
                    Ply.core.notify('loaded-category',self, {categoryUrl:''});
                    $(window).smartresize();


                } else if (self.previousCatExisted) {

                    Ply.core.notify('toggle-category');

                }

            } else if (isCat) {

                if (self.previousUrl !== undefined) {

                    self.options.type = "split";
                    content = self.cache['product_split'];
                    self.replaceView(content);
                    Ply.core.notify('loaded-category',self, {categoryUrl:''});
                    $(window).smartresize();

                } else {

                    Ply.core.notify('toggle-category');


                }

                


            }


            self.previousUrl = url;
            self.previousCatExisted = isCat;


            
            
            
            return;
        },

        //listen to notification initiated from filterbar.js
        filteredListing: function(note, sender, data) {

            var self = this;

          //  self.checkState(false, data.categoryUrl);



            return;
        }



    });

})(jQuery);


// festive snow effect

/*(function() {

    function createSnowController() {

        var canvas = null;
        var context = null;
        var totalParticles = 140;
        var canvasWidth;
        var canvasHeight;
        var heart1 = new Image();
        heart1.src = '/images/p2/product/heart-1.png';
        var heart2 = new Image();
        heart2.src = '/images/p2/product/heart-2.png';
        var hearts = [{
            image: heart1,
            width: 50,
            height: 49
        }, {
            image: heart2,
            width: 50,
            height: 49
        }
        ];
        var depth = 10;
        var maxDepth = null;
        var randomSeed1 = 3 + Math.random();
        var randomSeed2 = 3 - Math.random();
        var gravity = 0.02;
        var mouseX = null;
        var mouseY = null;
        var loopInterval = null;
        var particles = null;

        function createParticles(num) {
            var newParticles = [];
            for (var i = 0; i < num; i++) {
                var particle = {};
                randomizeParticle(particle);
                newParticles.push(particle);
            }
            return newParticles;
        }

        function randomizeParticle(particle,forcedY) {
            particle.x = particle.tx = Math.random() * canvasWidth;
            particle.y = particle.ty = forcedY !== undefined ? forcedY : Math.random() * (canvasHeight + 50) - 50;
            particle.z = particle.tz = Math.random() * maxDepth;
            var scale = depth / (depth + particle.z);
            particle.vy = Math.sqrt(Math.max(0,particle.y + 50) * gravity * scale * 2);
            particle.type = Math.floor(Math.random() * hearts.length);
            particle.spinOffset = Math.random() * Math.PI * 2;
            particle.sineOffset = Math.random() * Math.PI * 2;
            particle.r = particle.tr = Math.random();
            return particle;
        }

        function randomizeParticleX(particle) {
            particle.x = particle.tx = Math.random() * canvasWidth;
            return particle;
        }

        function createParticle(x, y, z) {
            var particle = {
                x: x,
                y: y,
                z: z,
                type: null
            };
            return particle;
        }

        function move() {
            randomSeed1 += Math.random() - 0.5;
            randomSeed2 += Math.random() - 0.5;
            var l = particles.length;
            for (var i = 0; i < l; i++) {
                var particle = particles[i];
                if (particle.y > canvas.height) {
                    randomizeParticle(particle,-50);
                } else {
                    var scale = depth / (depth + particle.z);
                    particle.vy += scale * gravity;
                    particle.ty += particle.vy;

                    particle.tx += scale * Math.sin(particle.y / canvasHeight * randomSeed1 - particle.sineOffset);
                    //particle.tx += scale * 2 * Math.sin(particle.z / canvasHeight * randomSeed2 - particle.sineOffset);

                    if (mouseX !== null) {
                        var heart = hearts[particle.type];
                        var spinScale = Math.sin(particle.spin);
                        var width = heart.width * scale * Math.abs(spinScale);
                        var height = heart.height * scale;

                        var dx = particle.x + width / 2 - mouseX;
                        var dy = particle.y + height / 2 - mouseY;
                        var d = Math.sqrt(dx * dx + dy * dy);
                        var f = 1 / d;
                        f = Math.min(f, 0.05);
                        var a = Math.atan2(dy, dx);
                        var cx = Math.cos(a);
                        var cy = Math.sin(a);
                        //particle.tx += cx * f * 10;
                        //particle.ty += cy * f * 10;
                    }

                    var oldy = particle.y;
                    var oldx = particle.x;
                    particle.x += (particle.tx - particle.x) / 20;
                    particle.y += (particle.ty - particle.y) / 20;
                    particle.z += (particle.tz - particle.z) / 20;
                    particle.tr = particle.x - oldx;
                    particle.r += (particle.tr - particle.r) / 100;
                    if (particle.x < -50) {
                        particle.x = particle.tx = canvasWidth + 50;
                    } else if (particle.x > canvasWidth) {
                        particle.x = particle.tx = -50;
                    }
                    particle.spin = Math.abs(oldy - particle.y) * 1.5 + particle.spinOffset;
                }
            }
        }

        function render() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var l = particles.length;
            for (var i = 0; i < l; i++) {
                var particle = particles[i];
                drawHeart(context, particle, 0.5);
            }
        }

        function loop() {
            move();
            render();
        }

        function drawHeart(context, particle, size) {
            context.save();
            var v = 1 - particle.z / maxDepth;
            context.globalAlpha = v * v * v;

            var heart = hearts[particle.type];
            var scale = depth / (depth + particle.z);
            var spinScale = Math.sin(particle.spin);
            var width = heart.width * scale * size;// * Math.abs(spinScale);

            var height = heart.height * scale * size;
            context.translate(particle.x + width / 2, particle.y + height / 2);
            context.rotate(particle.r);
            context.drawImage(heart.image, -width / 2, -height / 2, width, height);
            context.restore();

        }

        var snowController = {
            isSnowing: false,
            $activeCanvas: null,

            startSnowing: function($el) {

                if (this.isSnowing) {
                    this.stopSnowing();
                }
                this.isSnowing = true;
                $('<canvas>').attr({
                    id: 'activeSnow',
                    width: $el.width() + 'px',
                    height: $el.height() + 'px'
                }).appendTo($el);


                this.$activeCanvas = $('#activeSnow');

                canvas = this.$activeCanvas.get(0);
                context = canvas.getContext('2d');
                canvasWidth = canvas.width;
                canvasHeight = canvas.height;
                totalParticles = Math.floor(canvasWidth * canvasHeight/500);
                maxDepth = Math.min(canvasHeight, canvasWidth) / 2;
                //this.$activeCanvas.on('mousemove', function(event) {
                //    var rect = this.getBoundingClientRect();
                //    mouseX = event.clientX - rect.left;
                //    mouseY = event.clientY - rect.top;
                //});
                if(particles === null){
                    particles = createParticles(totalParticles, canvas.width, canvas.height);
                }else{
                    var l = particles.length;
                    for (var i = 0; i < l; i++) {
                        var particle = particles[i];
                        randomizeParticleX(particle);
                    }
                }
                loop();
                loopInterval = setInterval(function() {
                    loop();
                }, 30);
            },

            stopSnowing: function() {
                if (!this.isSnowing) {
                    return;
                }
                clearInterval(loopInterval);
                this.$activeCanvas.unbind('mousemove');
                this.$activeCanvas.remove();
                this.isSnowing = false;
                context = null;
                canvas = null;
                mouseX = null;
                mouseY = null;
            }
        };

        return snowController;
    }

    var snowController = createSnowController();
    var timeoutId = null;

    if (!$.browser.lteIe6) {
        $('.template').delegate('.product-festive','mouseenter',function(){

            if(timeoutId !== null){
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            snowController.startSnowing.call(snowController,$(this).find('.snow'));
        });

        $('.template').delegate('.product-festive','mouseleave',function(){
            timeoutId = setTimeout(function(){
                snowController.stopSnowing.call(snowController);
            },500);

        });
    }




})();*/