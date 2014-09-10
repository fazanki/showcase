define(['backbone', 'helpers'], function(Backbone, Helpers){
	
	var Slide = Backbone.View.extend({
		
		className: 'slide',

		template:  function(id) {
            return _.template($("#"+id).html());
        },

		render: function() {
			var contentType = this.getContentType();
			this['render'+Helpers.capitalize(contentType)]();

			return this;
		
		},

		getContentType: function() {
			if ( this.model.get('links') ) {
				return 'links';
			} else if ( this.model.get('inputs') ) {
			 	return 'inputs';	
			} 

		},

		renderLinks: function() {
			var self  = this,
				links = this.model.get('links');

			this.$el.addClass('linksBox');

			_.each(links, function(links){
				self.renderLink(links);
			});
		},

		renderLink: function(links) {
			var link_template = this.template('linksTemplate'),
				link          = link_template(links);

			this.$el.append(link);
		},

		renderInputs: function() {
			var self = this,
				inputs = this.model.get('inputs');
			
			this.$el.addClass('inputBox');

			_.each(inputs, function(inputs, i){
				self.renderInput(inputs, i);
			}, this);

		},

		renderInput: function(input, i) {
			// check if objec is undefind than define it set it to false
			// so that it dosne't have to be done in the json object
			// TEMPORARY MOVE TO OUTSIDE FUNCTION 
			if (input.submit == undefined) {
			 	var array = this.model.get('inputs');
				array[i].submit = false;
				this.model.set('input', array);
			}

			if (input.checkBox == undefined) {
				var array = this.model.get('inputs');
				array[i].checkBox = false;
				this.model.set('input', array);
			}
			
			var inputTemplate =	 this.template('inputTemplate');
				inputLineItem = inputTemplate(input);
				
			this.$el.append(inputLineItem);
		}

	});

	return Slide;
});