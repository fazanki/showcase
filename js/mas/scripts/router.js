define(['backbone'], function(Backbone){
	
	var Main = Backbone.Router.extend({
		
		routes: {
			''				: 'redirect', 
			'ex1/'			: 'home1',
			'ex1/step/:id'	: 'showSlide',
			'ex2/'			: 'home2'
		},

		home1: function() {
			App.Vent.trigger('initEx1');
		},

		home2: function() {
			App.Vent.trigger('initEx2');
		},

		showSlide: function(slideIndex) {
			console.log('side index='+slideIndex);
			App.Vent.trigger('changeSlide', {
				slideIndex: slideIndex,
				direction: 'next'
			});
		}, 

		redirect: function() {
			App.router.navigate('ex1/');
			this.home();

		}

	});

	return Main
	
});