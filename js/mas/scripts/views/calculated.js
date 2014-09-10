define(['backbone'], function(Backbone){
	
	var values = Backbone.View.extend({
		
		className: 'slide',

		template:  function(id) {
            return _.template($("#"+id).html());
        },

        initialize: function() {
        	//debugger
        	//this.model.on('change', this.render, this);
        	//this.render();
        },

        displayCalculation: function() {
			console.log('displaying calculation')
		}, 

		render: function() {

			var template = this.template('tableOutput');

			var tableItems = template(this.model.toJSON());
			console.log('rendering');
			
			this.$el.append(tableItems);

			return this;

		},

		renderWithDeposit: function() {
			var template =  this.template('tableDepositOutput');
			var tableItems = template(this.model.toJSON());
			this.$el.append(tableItems);
		}

	});

	return values;
});