define([
    'backbone',
   	'views/slides',
    'collections/slides',
    'router',
    'collections/FormFields',
    'views/calculations'
    ], function(
        Backbone,
        SlidesView,
        SlidesCollections,
        MainRouter,
        FromFildsCollection,
        calculationViews
        ) {

    var AppView = Backbone.View.extend({

        el: 'body',

        initialize: function() {
            console.log(window.slides);
            new SlidesView({
                collection: new SlidesCollections(window.slides)
            });

            App.router = new MainRouter();
            Backbone.history.start();
        },

        events: {
            'keyup': 'keyUp',
            'click .icon-arrow-right' : 'rightClick',
            'click .icon-arrow-left'  : 'leftClick',
            'change input'  : 'initCalculate',
        },

        textInputChange: function() {
            console.log('input has changed')
        },


        rightClick: function(e) {
            App.Vent.trigger('changeSlide', {
                direction:  'next'
            });
            return false
        },

        leftClick: function(e) {
            App.Vent.trigger('changeSlide', {
                direction:  'prev'
            });
            return false
        },

        keyUp: function(e) {
            // 37 left
            // 39 right
            if (e.keyCode === 37 || e.keyCode === 39) {
                App.Vent.trigger('changeSlide', {
                    direction: e.keyCode === 39 ? 'next' : 'prev'
                });
            }
        },

        initCalculate: function() {
            var your_income    = $('input[name="your_income"]').val(),
                deposit        = $('input[name="deposit"]').val(),
                second_income  = $('input[name="second_income"]').val(),
                commited_spend = $('input[name="commited_spend"]').val(),
                property_value = $('input[name="property_value"]').val();

            var obj = {
                'your_income'       : your_income,
                'deposit'           : deposit,
                'second_income'     : second_income,
                'commited_spend'    : commited_spend,
                'property_value'    : property_value
            }


            new calculationViews({
               collection: new FromFildsCollection(obj)
            });

            return false
        },

        fieldChanged: function(e){
            var field = $(e.currentTarget);
            var data = {};
            data[field.attr('id')] = field.val();
            this.model.set(data);
        },



    });

    return AppView;
});