
(function($, undefined) {

    Ply.ui.define('productQuickbuy', {

        // cache views for quick subsequent retrievals
        cache: {},

        options: {
            viewerVersion: 'product_viewer',
            isQuickbuy: true,
            selectedSkuId: null, //only passed in when opening quickEdit. Required for tracking purposes to determine if a new item is added or an item is edited.
            selectedQuantity: null //only passed in when opening quickEdit. Required to detrmine if items are added (i.e changinging quantity 1 to 2) or removed (i.e changinging quantity 2 to 1)

        },

        __init: function() {

            var self = this;

            this.events();

            // clear cache every 15mins
            setInterval(function() {
                self.clearCache();
            }, 1000 * 60 * 15);
            
            Ply.core.notify('update-forms',this.view);
            
            // refresh modal to ensure it calculates
            // dimensions after forms have been styled
            this.refreshModal();

            if (window.Crm && Crm.onPageChange) {
		    	Crm.onPageChange();
		    }

            return;
        },

        __objects: {
            image: '.product-image',
            info: '.product_detail_info',
            colorSet: '.color-set',
            defaultSkuId: '#defaultSkuId'
        },

        __partials: {
            info: 'product_detail_info'
        },
        
        __notifications: {
        	'added-item-to-cart': 'closeQuickbuy',
            'product_info-error-updated': 'refreshModal',
            'quickbuy-modal-closed': 'clearCache'
        },

        events: function() {

            var self = this;

            this.objects.colorSet.delegate('a', 'click', function(e) {
                e.preventDefault();

				if ($(this).parent(".color").hasClass("color-selected")) {
					return;
				}
                
                
                self.getView($(this).parent()[0].id);
        
                

            });

            return;
        },

        getView: function(productId) {

            var self = this,
            	productUrl;
            
            if (self.options.isQuickbuy){
				productUrl = '/quickbuy-' + productId;
			}else {
				productUrl = '/quickbuy-' + productId + '?commerceItemId=' + self.options.commerceItemId + '&skuId=' + self.options.skuId + '&quantity=' + self.options.quantity;
			}
		
            // if response has been cached
            if (this.cache[productId]) {
            	
                this.updateView(this.cache[productId]);
                
                return;
            }
            
            this.showLoader();
			
			Ply.ajax.request({
                    url: productUrl,
                    type: 'GET'
                }, function(html, textStatus, xhr){
					
					self.hideLoader();
	                
	                self.cache[productId] = html;
                    self.updateView(html, true);
					
				}, function() {

					self.hideLoader();
	
	            });
				

            return;
        },

        // update view with html
        updateView: function(html, fadeIn) {
            
            this.view = $(html);
            $.modal.update(this.view);
            this.refreshView(fadeIn);

            return;
        },

        // refreshes view after replacing html with new content
        // pass in true to fade in image
        refreshView: function(fadeIn) {

			var self = this,
                defaultSkuId = this.objects.defaultSkuId.val();  // retrieved to be passed to analytics
			
            this.__bindObjects();
            this.__bindPartials();
            this.__bindNotifications();
            this.__init();
            
            if (fadeIn) {
                this.objects.image.find('img').hide().load(function() {
                    $(this).fadeIn();
                });
            }
            if (window.Crm && Crm.onPageChange) {
		    	Crm.onPageChange();
		    }

            return;
        },
        
        // refreshes modal dimensions
        refreshModal: function () {
            
            $.modal.refresh();
            
            return;
        },
        
        // closes modal
        closeQuickbuy: function() {

            $.modal.close(this.options.isQuickbuy ? true : false);
            
        	return;
        },

        clearCache: function() {
            
            this.cache = {};
            
            return;
        },

        __destroy: function () {

            this.clearCache();

        }

    });

})(jQuery);