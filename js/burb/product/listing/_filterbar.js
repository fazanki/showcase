// infinite scroll

(function($, undefined) {

    Ply.ui.define('listing_filterbar', {

        __init: function() {

            this.scrollEvents();
            this.events();

            if(!$('#filterBar').hasClass('filterBarHeritage')) {

                this.checkState(false);
            }

            // we need to dynamically set the link widths to correctly render
            this.view.find('ul').each(function(){

                var list = $(this);
                var width = list.width();

                // we could find the padding dynamically but must first be visible for ie6
                // var padding = parseInt(list.find('a').css('padding-left')) * 2;
                var padding = 40;

                list.find('a').css({
                    'width':width - padding
                });
            });

            return;
        },

        __objects: {
            filterBar: this.view,
            categoryFilter: '.category-filter',
            subCategoryFilter: '.subcategory-filter',
            categoryLinks: '.category-links a',
            categoryList: '.category-links',
            categoryFilterList: '#category-filter',
            colourFilter: '#colour-filter',
            categoryFilterListLinks: '#category-filter a',
            subCategoryFilterList: '#subcategory-filter',
            subCategoryFilterListLinks: '#subcategory-filter a',
            template: '#template',
            hertitageShelf: '.category-row-heritage'
        },

        __notifications: {
            'loaded-category': 'checkState'

        },

        scrollEvents: function() {

            var self = this;
            var isHeritage = false;
            var bannerHeightFlag = false;

            // don't bind 'sticky' behaviour for touch devices or ie6
            // can't manipulate DOM with JavaScript while scrolling, breaks user experience
            if (self.html.hasClass("no-touch") && !self.html.hasClass('msie6')) {

                $(window).resize( function(){

                    var filterBar = self.view;
                    var templateWidth = $('#template').width();

                    filterBar.css({
                        'width': templateWidth
                    });

                });

                var template = $('#template'),
                    titlebar = $('.-titlebar'),
                    titlebarHeight = titlebar.outerHeight(),
                    banner = template.find('.banner-split').eq(0),
                    breakpoint = titlebarHeight,
                    filterBar = this.view,
                    html = $('html'),
                    glyphs = "roman";

                // there must be a cleaner way of doing this
                if (html.hasClass('lang-ko') ||
                    html.hasClass('lang-ja') ||
                    html.hasClass('lang-zh') ||
                    html.hasClass('lang-zf')) {

                    glyphs = "asian";
                }

                if(filterBar.hasClass('filterBarHeritage')) {
                    isHeritage = true;
                }


                $(window).scroll(glyphs, function(){

                    // filter bar will only be moved if still child of #template

                    var verticalScroll = $(window).scrollTop(),
                        sharedHeaderHeight = $('#shared_header').outerHeight();

                    // heritage filterbar is below banner so we need to change point that
                    // filterbar sticks to top of column
                    // sets flag to true once banner height cached
                    if(isHeritage == true && bannerHeightFlag == false) {
                        var bannerHeight = banner.outerHeight();
                        breakpoint = breakpoint + bannerHeight;
                        bannerHeightFlag = true;
                    }

                    // stop navs being left out of position if page scrolls
                    filterBar.find('ul').removeClass('active');

                    if (verticalScroll >= breakpoint) {

                        filterBar.addClass('active');

                        filterBar.css({
                            'width': template.width(),
                            'top': sharedHeaderHeight
                        });

                        filterBar.detach();
                        filterBar.insertBefore(template);

                        // animate height and font for festive
                        if(isHeritage == false) {

                            var fontSize = '1.9em';

                            if (glyphs == "asian") {
                                fontSize = '1.45em';
                            }

                            filterBar.animate({
                                'height':'60',
                                'fontSize':fontSize
                            }, '500', 'swing', function(){
                                // jQuery's animate() will set overflow:hidden by default
                                // we need to clear this to stop drop-downs being clipped
                                filterBar.css({
                                    'overflow':'visible'
                                });
                            });

                        }

                        template.css({
                            'padding-top':60 + sharedHeaderHeight
                        });

                    }
                    else if (verticalScroll <= breakpoint && $('#template #filterBar').length === 0) {

                        filterBar.removeClass('active');

                        filterBar.css({
                            'width': '100%',
                            'top': '0'
                        });

                        template.css({
                            'padding-top': sharedHeaderHeight
                        });

                        filterBar.detach();

                        // heritage has different behaviour where filterbar comes after banner
                        if(isHeritage == true){
                            filterBar.insertAfter(banner);
                        } else {
                            filterBar.insertAfter(titlebar);
                        }

                        filterBar.clearQueue();

                        // animate height and font for festive
                        if(isHeritage == false) {

                            var fontSize = '2.15em';

                            if (glyphs == "asian") {
                                fontSize = '1.6em';
                            }

                            filterBar.animate({
                                'height': '90',
                                'fontSize':fontSize
                            }, '500', 'swing', function(){
                                // jQuery's animate() will set overflow:hidden by default
                                // we need to clear this to stop drop-downs being clipped
                                filterBar.css({
                                    'overflow':'visible'
                                });
                            } );

                        }

                    }
                    else {
                        return false;
                    }

                });

            }

            return;
        },



        events: function () {

            var self = this;
            var timeout;

            // enable us to close navs on touch devices by clicking outside nav
            $('#site').click(function() {
                self.objects.subCategoryFilterList.removeClass('active');
                self.objects.categoryFilterList.removeClass('active');
            });

            // open relevant filter nav
            this.view.delegate(('h2 a'),'click', function(e){
                e.stopPropagation();
                e.preventDefault();

                var filterBar = $('#filterBar'),
                    nav = $(this),
                    text = nav.find('u'),
                    filter = $('#' + nav.attr('class')),
                    position = text.position(),
                    filterWidth = filter.width(),
                    textWidth = text.width();

                var button = $('#colour-filter');

                // we need to make slight calculation change for heritage
                // because of different structure to nav button
                if(filterBar.hasClass('filterBarHeritage')) {

                    var width = button.width();
                    var innerWidth = button.innerWidth();
                    textWidth = width - ((innerWidth-width)/2);

                }

                filterBar.find('ul').removeClass('active');
                filter.addClass('active');

                filter.css({
                    'left': Math.floor(position.left + ((textWidth/2) -1)),
                    'top': Math.floor(position.top),
                    'margin-left': (1 - (filterWidth/2))
                });

            });

            // close filter nav on mouseout
            this.view.delegate(('ul'),'mouseout', function(){

                var menu = $(this);

                // don't start timer if touch device as there's no mouse event to clear it later
                if (self.html.hasClass("no-touch")) {

                    // timeout prevents overly sensitive browsers closing nav prematurely
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        menu.removeClass('active');
                    }, 200);

                }

            });

            this.view.delegate(('li'),'mouseover', function(){
                clearTimeout(timeout);
                $(this).parents('ul').addClass('active');
            });


            // filter new page content onclick
            this.view.delegate(('li a'),'click', function(e){

                e.preventDefault();

                var link = $(this);

                // festive and heritage use quite different approaches and methods to refresh category content
                // festive ajax's in new category data
                // heritage repopulates existing markup from inline JSON object
                if($('#filterBar').hasClass('filterBarHeritage')) {

                    // this is heritage
                    // update active colour
                    var colour = link.parent().attr('data-colour');
                    var targetURL = link.parent().attr('data-url');
                    var text = link.text();
                    var header = self.objects.colourFilter.parent();

                    header.attr('class','');
                    header.addClass('colour-' + colour);
                    self.objects.colourFilter.find('u').text(text);

                    // only use replaceState() if it is supported ie10+
                    if(window.history.replaceState) {
                        window.history.replaceState(null, null, targetURL);
                    }

                    // repopulate shelves with correct products
                    self.populateShelves(colour);

                } else {
                    // this is festive

                    // set active category
                    link.parents('ul').find('a').removeClass('active');
                    link.addClass('active');

                    // festive links are disabled when active
                    if(link.hasClass('disabled') || link.hasClass('active')) {
                        return false;
                    } else {
                        self.setCategory($(this));
                        self.filterUrl();
                    }
                }


            });

        },

        // we're going to repopulate the shelves from inline JSON by selected colour
        populateShelves: function(selectedColour) {

            var self = this;
            var categoryNumbers = Ply.Globals.categoriesJSON;
            var categoryData = Ply.Globals.heritageJSON.categories;
            var colours = categoryNumbers.filterCategoryMap;
            var colourKey = 'colour' + String(selectedColour);
            var shelves = $('.category');

            var productHtml = shelves.find('.product').eq(0); // cache product markup
            var shelfHtml = $('.category').eq(0).clone();

            // clean existing products from shelf HTML object
            shelfHtml.find('.product').remove();
            // reset any visible footer
            shelfHtml.find('.category-footer').removeClass('category-footer-active');

            // reset shelf height in-case open
            shelfHtml.removeClass('category-is-open');


            // remove existing heritage shelves
            $('.category-row-heritage').remove();

            //self.objects.hertitageShelf.remove();

            // update share functionality with updated URLs
            var share = $('#share');
            var faceBookShare = share.find('.link-facebook');
            var twitterShare = share.find('.link-twitter');
            var googleShare = share.find('.link-google-plus');
            var urlShare = document.URL;
            var locale = faceBookShare.attr('data-locale');
            var pageTitle = this.objects.template.find('h1').text();

            faceBookShare.attr('href', 'http://www.facebook.com/sharer.php?u=' + urlShare + '%3Flocale=' + locale );
            twitterShare.attr('href', 'http://twitter.com/intent/tweet?text=' + encodeURI(pageTitle) + '%20@Burberry&url=' + urlShare + '%3Flocale=' + locale + '&related=Burberry&via=Burberry' );
            googleShare.attr('href', 'https://plus.google.com/share?url=' + urlShare + '%3Flocale=' + locale );


            // loop through colours to match colour category
            for(var i=0;i<colours.length;i++) {

                // match colour category
                for(var key in colours[i]) if (key === colourKey) {

                    // colour category matched
                    var subCategories = colours[i]['' + colourKey + ''];

                    // loop through corresponding style sub-categories
                    for(var i=0;i<subCategories.length;i++) {

                        var subCategoryId = subCategories[i].categoryId;

                        // loop through categoryData JSON
                        for(var a=0;a<categoryData.length;a++) {

                            var subCategory = categoryData[a];
                            var shelfNo = i-1;

                            // match individual categories to sub-categories for this colour
                            for(var key in categoryData[a]) if (key === subCategoryId) {

                                // we now have an object with data for an individual shelf
                                // populate corresponding shelf with this sub-category data
                                var shelfData = subCategory['' + subCategoryId + ''][0];
                                var thisShelf = shelfHtml.clone();


                                /*var thisShelf = '<div id="category-' + shelfData.categoryId + '" class="category category-row-1  category-row-heritage" data-name="cat1670059" data-url="' + shelfData.url + '" data-rows="1" data-is-loaded="true" data-is-open="false" data-track-name="' + shelfData.displayName + '">' +
                                                    '<div class="category-header">' +
                                                        '<h2 class="category-title -title -title-h3">' + shelfData.displayName + '</h2>' +
                                                    '</div>' +

                                                    '<div class="products">' +
                                                        '<ul class="product-set product_set-heritage" data-track-name="Slim Fit">' +

                                                            '<li class="tray-description aspect aspect-ratio-9x8">' +
                                                                '<div class="aspect-inner">' +
                                                                    '<div class="aspect-inner-container">' +
                                                                        '<h3>' + shelfData.title + '</h3>' +
                                                                        '<div class="divider"><!-- --></div>' +
                                                                        '<p>' + shelfData.longDescription + '</p>' +
                                                                    '</div>' +
                                                                '</div>' +
                                                            '</li>' +

                                                        '</ul>' +
                                                    '</div>' +

                                                    '<div class="category-footer category-footer-active">' +
                                                        '<a class="category-expand category-toggle" href="#" data-category-url="/mens-heritage-trench-coat-collection/honey/slim-fit/">' +

                                                            '<span class="category-toggle-text category-toggle-text-maximize">' +
                                                                'View All Slim Fit <span class="counter"> / 7</span> <span class="-icon -icon-font"></span>' +
                                                            '</span>' +
                                                            '<span class="category-toggle-text category-toggle-text-minimize">' +
                                                                'Minimise Slim Fit <span class="-icon -icon-font"></span>' +
                                                            '</span>' +
                                                        '</a>' +

                                                    '</div>' +

                                                '</div>';*/

                                // populate shelf tray-description markup with fresh data
                                thisShelf.find('.category-title').html(shelfData.displayName);
                                thisShelf.find('h3').html(shelfData.title);
                                thisShelf.find('p').html(shelfData.longDescription);
                                thisShelf.attr('data-url',shelfData.url)
                                    .attr('data-track-name', shelfData.displayName)
                                    .attr('data-name',shelfData.categoryId)
                                    .attr('id','category-' + shelfData.categoryId);

                                // loop through shelf products populating markup
                                var productsData = shelfData.products;
                                var productsLength = productsData.length;

                                for(var b=0;b<productsLength;b++) {

                                    var product = productHtml;

                                    //var product = products.eq(b);
                                    var productData = productsData[b];
                                    var productTitle = product.find('.product-title');
                                    var productImage = product.find('img');
                                    var productLink = product.find('.product-link');
                                    var productPrice = product.find('.product-price-amount');
                                    var productSet = thisShelf.find('.product-set');

                                    // set view all counter
                                    thisShelf.find('.counter').text(' / ' + productsLength + '');

                                    productTitle.html(productData.title);

                                    productImage.attr('src',productData.image)
                                        .attr('alt',productData.title)
                                        .attr('data-src',productData.dataSrc)
                                        .removeClass('ctg-lazyload-img'); // this could be done to the HTML fragment to be more efficient
                                        //.addClass('ctg-lazyload-img-is-loaded'); // force lazyload any images remaining hidden

                                    productLink.html(productData.title)
                                        .attr('href',productData.url)
                                        .attr('data-product-id',productData.dataProductId)
                                        .attr('data-categoryid',productData.dataCategoryid);

                                    productPrice.html(productData.formattedListPrice);

                                    // wrap the object so we can use html() to inject entire object
                                    var html = product.wrap('<div></div>').parent().html();

                                    productSet.append(html);


                                }

                                $('.category').eq(shelfNo).before(thisShelf);

                                //self.objects.hertitageShelf = $('.category-row-heritage');

                            }

                        }

                    }

                }

            }

            // we need to trigger a rebuild of some of the grid resize and layout functionality
            // do to the grid having just been rebuilt
            Ply.core.notify('listing-shelf-refresh');

        },

        //get the url of the category that needs to be ajaxed in. /product/listing.js will be listening for the hash change.
        filterUrl: function(isInit){

            var activeCategoryId = this.objects.categoryFilter.data('categoryId'),

                activeSubCategoryId = this.objects.subCategoryFilter.data('categoryId'),

                categoryUrl = this.objects.categoryLinks.filter('.' + activeCategoryId + '-' + activeSubCategoryId).attr('href'),

                categoryName = this.objects.categoryFilter.data('trackName'),

                subCategoryName = this.objects.subCategoryFilter.data('trackName');

            if (!isInit) {
                $.bbq.pushState({url: categoryUrl},2);
            }


            Ply.core.notify('filtered-listing',this, {categoryUrl:categoryUrl, categoryName:categoryName, subCategoryName:subCategoryName});

            return;
        },

        //hashchange and based on the hash change need to change the copy in the title based on the new category
        checkState: function (isInit) {

            var self = this,
            // pass in true to ensure we coerce
                state = $.bbq.getState(true),
                url = state['url'],
                activeIds,
                currentCategory = this.objects.categoryFilter.data('categoryId'),
                currentSubcategory = this.objects.subCategoryFilter.data('categoryId'),
                catId, subCatId;


            if (!!url) {
                activeIds = self.getCategoryIds(url);

                if (activeIds){
                    var ids = activeIds.split('-');
                    self.setCategory(this.view.find('.cat-' + ids[0]));
                    self.setCategory(this.view.find('.cat-' + ids[1]));
                }else {

                    catId = this.objects.categoryFilterListLinks.first().data('categoryId'),
                        subCatId = this.objects.subCategoryFilterListLinks.first().data('categoryId');

                    self.setCategory(this.view.find('.cat-' + catId));
                    self.setCategory(this.view.find('.cat-' + subCatId));
                }
            } else {

                catId = this.objects.categoryFilterListLinks.first().data('categoryId'),
                    subCatId = this.objects.subCategoryFilterListLinks.first().data('categoryId');

                self.setCategory(this.view.find('.cat-' + catId));
                self.setCategory(this.view.find('.cat-' + subCatId));

            }

            //reset nav to default state
            this.objects.subCategoryFilterListLinks.addClass('disabled').removeClass('active');
            this.objects.categoryFilterListLinks.addClass('disabled').removeClass('active');

            // set nav active states for current category and subcategory
            this.view.find('.cat-' + currentCategory).addClass('active');
            this.view.find('.cat-' + currentSubcategory).addClass('active');

            //enable existing subcategories
            this.objects.subCategoryFilterListLinks.each(function(){

                var subcategory = $(this),
                    thisSubcategory = subcategory.data('categoryId'),
                    combinedCategoryId = currentCategory + '-' + thisSubcategory;

                if (self.objects.categoryList.find('.' + combinedCategoryId).length === 1) {
                    subcategory.removeClass('disabled');
                }

            });

            //enable existing categories
            this.objects.categoryFilterListLinks.each(function(){

                var category = $(this),
                    thisCategory = category.data('categoryId'),
                    combinedCategoryId = thisCategory + '-' + currentSubcategory;

                if (self.objects.categoryList.find('.' + combinedCategoryId).length === 1) {
                    $('.cat-' + thisCategory).removeClass('disabled');
                }

            });


            if (state['url'] && state['url'].length > 0) {
                self.filterUrl(isInit);
            }


            return;
        },

        //find
        getCategoryIds: function(categoryUrl){

            var categoryIds;

            this.objects.categoryLinks.each(function(obj, el ){
                if ($(this).attr('href') === categoryUrl) {
                    categoryIds = this.className;
                    return false;
                }
            });


            return categoryIds;
        },

        setCategory: function (category) {

            var parent = category.parents('ul'),
                filter = parent.attr('id'),
                text = category.html(),
                anchor = $('.' + filter);

            anchor.find('u').html(text);
            anchor.data('categoryId', category.data('categoryId'));
            anchor.data('trackName', category.data('trackName'));
            parent.removeClass('active');

        }


    });

})(jQuery);