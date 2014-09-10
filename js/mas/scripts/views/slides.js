define([
	'backbone', 
	'views/slide', 
	'collections/FormFields',
	'views/calculations'
	], 
	function(
		Backbone, 
		SlideView, 
		FromFildsCollection,
		calculationViews
		) {
	
	var SlidesView = Backbone.View.extend({
		
		el: $('.slides'),
 
		initialize: function() {
			this.currentSlideIndex = 1;
			this.numSlides = this.collection.length;
			this.transitionSpeed = 400;
			
			App.Vent.on('initEx1', this.positionSlidesInitCalculations, this);
			App.Vent.on('initEx2', this.setTextInitCalculations, this);
			App.Vent.on('changeSlide', this.changeSlide, this);

		},

		template:  function(id) {
            return _.template($("#"+id).html());
        },

		positionSlidesInitCalculations: function() {
			this.$el.empty();
			this.renderAll();
			//.this.$el.closest('.container').removeClass('text-version');

			this.$el.children(':nth-child(n+2)').hide();

			new calculationViews({
           		collection: new FromFildsCollection({})
            });

		},

		setTextInitCalculations: function() {
			this.$el.empty();
			this.$el.closest('.container').addClass('text-version');
			
			this.setTextVersion();
 			//debugger;
 			
			var template = this.template('textTemplate');
			this.$el.append(template);

			$('.tooltips').tooltipster({
				 trigger: 'click',
				 interactive: true
				});

			console.log('ex2');
			new calculationViews({
           		collection: new FromFildsCollection({})
            });
		},



		setTextVersion :function() {

		},

		changeSlide: function(opts) {
			var newSlide;
			var slides = this.$el.children();
			var self = this;
			console.log(opts);
			

			this.setCurrentSlideIndex(opts);
			
			// filter the new slide
			/// VERY IMPORTANT !!! THIS IS WHRE ALL THE LOGGIC IS HAPPENING 
			/// AND FIGURING WHICH SLIDE WE ARE WORKING ON
			newSlide = slides.eq(this.currentSlideIndex - 1);

			newSlide = this.getNextSlide(slides);
			//console.log( newSlide )
			//slides.css('position','absolute')// TEMPORARY

			this.animateToNewSlide(slides, newSlide, opts.direction);

			App.router.navigate('ex1/step/' + this.currentSlideIndex);
		},

		setCurrentSlideIndex: function(opts) {
			if (opts.slideIndex) {
				return this.currentSlideIndex = ~~opts.slideIndex;
			}

			this.currentSlideIndex += (opts.direction === 'next') ? 1 : -1;
			
			if( this.currentSlideIndex > this.numSlides ) {
				// go back to slide 1
				this.currentSlideIndex = 1;
			}
			if ( this.currentSlideIndex <= 0) {
				
				this.currentSlideIndex = this.numSlides;
			}
		},

		animateToNewSlide: function(slides, newSlide, direction) {

			slides.filter(':visible')
				.animate({
					left: direction === 'next' ? '100%' : '-100%',
					//top: '-100%',
					opacity: 'hide'
				}, this.transitionSpeed, function() {
					$(this).css('left','0');

					newSlide
						.css('left', direction ==='next' ? '-100%' : '100%')
						.animate({
							left:0,
							opacity: 'show'
						}, self.transitionSpeed);
				});

		},

		getNextSlide: function(slides) {
			return slides.eq(this.currentSlideIndex - 1);

		},

		renderAll: function() {
			//console.log(this.collection);
			this.$el.empty();
			this.collection.each(this.render, this);
		},

		render: function(input) {
			var slideView = new SlideView({ model: input });
			this.$el.append(slideView.render().el);
			return this;
		}

	});

	return SlidesView;

});
