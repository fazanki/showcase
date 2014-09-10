define(['backbone', 'views/calculated'], function(Backbone, CalculatedView){
	

	var CalculationView = Backbone.View.extend({
		
		el: $('.output'),

		initialize: function() {
			this.renderAll();
		},

		templates: function() {

		},

		renderAll: function() {
			this.collection.each(this.render, this);	
		},

		testRender: function(obj) {
			debugger;
		},

		render: function(input) {
			var calView = new CalculatedView({ model: input });
			this.$el.empty();
			this.$el.append(calView.render().el);
			///this.$el.append(calView.renderWithDeposit().el); 
		}

	});

	return CalculationView;

});
