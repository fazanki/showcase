define(['backbone'], function(Backbone) {
	
	var Slide = Backbone.Model.extend({
		defaults: {
			type: '',
			input: '',
			label: '',
			title :'',
			button:''
		},

		initialize: function() {
			this.setTextSize();
		},

		setTextSize: function() {
			var length = this.get('title').length
			var size;
			
			if ( length >= 200 ) {
				size = 'x-large';
			} else if (length >= 100) {
				size = 'large';
			} else {
				size = 'normal'
			}
			console.log(size);
			this.set('size', size);
		}
	});

	return Slide;
});