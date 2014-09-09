/*global DBR, jQuery, document */
/*jshint eqeqeq: true, curly: true, white: true */

(function($) {

    Ply.ui.define('product_detail_email', {

		options: {
			requiredMessage: 'Please complete all required fields'
		},

        __init: function() {

          	this.events();
          	this.validation();
       

            return;
        },
        
        __objects: {
        	
        	emailForm: '#frmEmailProduct',
        	emailLink: '.submit-frmEmailProduct',
        	errors: '.error-container'
       
        },

		events: function() {
		
			var self = this;

			this.objects.emailLink.click(function(e){
				
				e.preventDefault();
				
	
				
				if (self.isValidForm()) {
				
					self.submitEmail();
					
					return true;
					
				}else {
				
					return false;
				
				}
			
				return;
				
			});
			
			
    		return;
        },
        
        validation: function(){
        
        	var self = this;
        
        	this.validator = this.objects.emailForm.validate({
	            	highlight: function(element) {
	                	$(element).parent('.-field').addClass('-field-invalid');
	                	self.objects.errors.html(Ply.res["requiredMessage"]);
						$.modal.refresh();
	             	},
	            	unhighlight: function(element, errorClass, validClass) {
	            		$(element).parent('.-field').removeClass('-field-invalid');
	             	},
	             	errorPlacement: function(error, element) {
	         	     	error.css({"display":"none"});
	         	   	}
	        });
			
	        
	        return;
        
        },
        
        isValidForm: function(){
        
        	 
	        if (this.validator.form())
            {
            	return true;
            } else {
            	return false;
            }
        	
     
        },
        
        submitEmail: function() {
        
        	var self = this,
        	formData = this.objects.emailForm.atgSerializeArray();
        	
        	Ply.core.notify("loading-started", this);

        
			
            Ply.ajax.request({
                    url: location.href,
                    type: 'POST',
	                data: formData
	                },
	                function(response) {
	                
	   
	                	Ply.core.notify("loading-finished", self);
	                	
	                    $.modal.close();
	                },
	                function(response) {
						
						
						Ply.core.notify("loading-finished", self);
						$.modal.close();
	                	
	                }

            );

    		return;
        }
        
        

    });

} (jQuery));