define(['backbone', 'models/formField'], function(Backbone, FieldModel){
	
	
	var Fields = Backbone.Collection.extend({
		model: FieldModel
	});

	return Fields;
});