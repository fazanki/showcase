

(function ($, undefined) {
    
    Ply.ui.define('product_sizeGuide', {
    
    	 options: {
            trackUrl: ''
        },
        
        __init: function () {
        	Ply.core.log(this.options.locale);
			this.tabs();			
			$.modal.refresh();
            return;
        },
		
		__objects: {
			tabSet: '#sizeguide-tabs',
			subTabSet : '#sizeguide-subtabs'
		},
		
		tabs: function() {
			
			var self = this;
			
			this.objects.tabSet.tabs();
			
			if(this.options.locale != 'US')
			{
				// If US display inches
				this.objects.subTabSet.tabs({active:1});
			}
			else
			{
				// else display CM first
				this.objects.subTabSet.tabs({active:0});
			}
			
			this.sizeUnit = "cm";
			this.measuringGuide = "";
			
			this.view.delegate('a','click',function(e){
				
				var clickedTab = $(this).attr('href'), units;

				switch(clickedTab){
					
					case "#tabs-1":
					
						self.measuringGuide = "";
					
						break;
						
					case "#tabs-2":
					
						self.measuringGuide = 1;
					
						break;
						
					case "#tabs-3":
					
						self.sizeUnit = "in";
					
						break;
						
					case "#tabs-4":
					
						self.sizeUnit = "cm";
					
						break;
				
				}
				
	
				Ply.core.notify("track-size-guide", this, {units:self.sizeUnit,measuringGuide:self.measuringGuide,url:self.options.trackUrl});
			
			});
			
		}
        
    });
    
})(jQuery);