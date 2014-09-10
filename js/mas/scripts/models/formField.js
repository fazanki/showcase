define(['backbone'], function(Backbone) {
	
	var FormField = Backbone.Model.extend({
		defaults: {
			'maximum_mortgage'		:0,	
			'monthly_repayment_4'	:0,
			'monthly_repayment_5'	:0,
			'monthly_repayment_6'	:0,
			'monthly_repayment_7'	:0,
			'interest_repayment_4'	:0,	
			'interest_repayment_5'	:0,
			'interest_repayment_6'	:0,
			'interest_repayment_7'	:0,
			'propety_price'			:0,
			'deposit_requiered_5'	:0,
			'deposit_requiered_10'	:0,
			'deposit_requiered_15'	:0,
			'deposit_requiered_20'	:0,
			'deposit_requiered_25'	:0,
			'your_income'			:0,	
			'second_income'			:0,
			'commited_spend'		:0,
			'deposit'				:0,
			'max_property_price_5'	:0,
			'max_property_price_10'	:0,
			'max_property_price_15'	:0,
			'max_property_price_20'	:0,
			'max_property_price_25'	:0,
			'stamp_duty_5'			:0,
			'stamp_duty_10'			:0,
			'stamp_duty_15'			:0,
			'stamp_duty_20'			:0,
			'stamp_duty_25'			:0,
			'cal_deposit_precent'	:0,
			'ltv'					:0

		},

		initialize: function() {
			this.doCalculations();
		},

		validate: function(attrs) {

			debugger;
			// your_income : {
			// 	required: true
			// }
			// if (!$.trim(attrs.your_income)) {
			// 	return "you must enter at least your income";
			// }

		},

		doCalculations: function() {
			var your_income 	= ~~this.get('your_income'),
				commited_spend 	= ~~this.get('commited_spend'),
				second_income 	= ~~this.get('second_income'),
				total_income	= (your_income + second_income)		
				deposit 		= ~~this.get("deposit"),
				max_propety_price = ~~this.get("roperty_value"),
				model			= this;
				//debugger;
			if (your_income) {
				this.doCalBasedOnIncomeOnly(total_income, commited_spend, model, deposit);
			}
		},

		doCalBasedOnIncomeOnly: function(total_income, commited_spend, model, deposit, max_propety_value) {
			var terms_repayment = 25;
			var debt = commited_spend * 12;
			var income = total_income;
			var income_multiplier  = 4.5;
			var interestRates_4 = 0.0499;
			var interestRates_5 = 0.0599;
			var interestRates_6 = 0.0699;
			var interestRates_7 = 0.0799;
			var deposit_5  = 0.05;
			var deposit_10 = 0.10;
			var deposit_15 = 0.15;
			var deposit_20 = 0.20;
			var deposit_25 = 0.25;
			var propety_price;

			var property_price_under_5 = deposit / 0.05;
			var maximum_mortgage_uder_5 = property_price_under_5 - deposit;
			
			var maximum_mortgage = (income - debt)*income_multiplier;


			var property_price_under_5 = deposit / 0.05;
			var maximim_mortgage_under_5 = property_price_under_5 - deposit;
			
			if (max_propety_value) {
				propety_price = max_propety_value;
			} else {
				propety_price = maximum_mortgage / (1-deposit_5);
			}
			
			var interest_rate_monthly_4 = interestRates_4/12;
			var interest_rate_monthly_5 = interestRates_5/12;
			var interest_rate_monthly_6 = interestRates_6/12;
			var interest_rate_monthly_7 = interestRates_7/12;
			var number_of_payments = terms_repayment * 12;
			
			var max_property_price = maximum_mortgage + ~~deposit;
			var cal_deposit_precent = (~~deposit / max_property_price)*100;
			


			if (cal_deposit_precent < 5 && deposit) {
				maximum_mortgage = maximum_mortgage_uder_5;
				max_property_price = property_price_under_5;
			}

			var ltv = (maximum_mortgage / max_property_price) *100; 

			console.log('cal_deposit_precent='+cal_deposit_precent);
			
			var options = {
				'maximum_mortgage'     :  maximum_mortgage,
				'deposit'			   :  deposit,
				'monthly_repayment_4'  :  this.calculateMonltyRepayments(maximum_mortgage, number_of_payments, interest_rate_monthly_4),
				'monthly_repayment_5'  :  this.calculateMonltyRepayments(maximum_mortgage, number_of_payments, interest_rate_monthly_5),
				'monthly_repayment_6'  :  this.calculateMonltyRepayments(maximum_mortgage, number_of_payments, interest_rate_monthly_6),
				'monthly_repayment_7'  :  this.calculateMonltyRepayments(maximum_mortgage, number_of_payments, interest_rate_monthly_7),
				'interest_repayment_4' :  (maximum_mortgage * interestRates_4) / 12,
				'interest_repayment_5' :  (maximum_mortgage * interestRates_5) / 12,
				'interest_repayment_6' :  (maximum_mortgage * interestRates_6) / 12,
				'interest_repayment_7' :  (maximum_mortgage * interestRates_7) / 12,
				'propety_price'        :  propety_price,
				'deposit_requiered_5'  :  (maximum_mortgage / (1 - deposit_5)) * deposit_5,
				'deposit_requiered_10' :  (maximum_mortgage / (1 - deposit_10)) * deposit_10,
				'deposit_requiered_15' :  (maximum_mortgage / (1 - deposit_15)) * deposit_15,
				'deposit_requiered_20' :  (maximum_mortgage / (1 - deposit_20)) * deposit_20,
				'deposit_requiered_25' :  (maximum_mortgage / (1 - deposit_25)) * deposit_25,

				'max_property_price_5'	: (maximum_mortgage + (maximum_mortgage/ (1 - deposit_5) * deposit_5)),
				'max_property_price_10'	: (maximum_mortgage + (maximum_mortgage/ (1 - deposit_10) * deposit_10)),
				'max_property_price_15'	: (maximum_mortgage + (maximum_mortgage/ (1 - deposit_15) * deposit_15)),
				'max_property_price_20'	: (maximum_mortgage + (maximum_mortgage/ (1 - deposit_20) * deposit_20)),
				'max_property_price_25'	: (maximum_mortgage + (maximum_mortgage/ (1 - deposit_25) * deposit_25)),

				'stamp_duty_5' 			: this.calculateStampDuty((maximum_mortgage + (maximum_mortgage/ (1 - deposit_5) * deposit_5))),
				'stamp_duty_10' 		: this.calculateStampDuty((maximum_mortgage + (maximum_mortgage/ (1 - deposit_10) * deposit_10))),
				'stamp_duty_15' 		: this.calculateStampDuty((maximum_mortgage + (maximum_mortgage/ (1 - deposit_15) * deposit_15))),
				'stamp_duty_20' 		: this.calculateStampDuty((maximum_mortgage + (maximum_mortgage/ (1 - deposit_20) * deposit_20))),
				'stamp_duty_25' 		: this.calculateStampDuty((maximum_mortgage + (maximum_mortgage/ (1 - deposit_25) * deposit_25))),

				'max_property_price'    : max_property_price,
				'cal_deposit_precent'   : cal_deposit_precent,
				'ltv'					: ltv,
				'stamp_duty'            : this.calculateStampDuty(max_property_price),

				'maximim_mortgage_under_5' : maximim_mortgage_under_5
			
			};

			this.setModelValues(options);

			console.log('calculating on income only ');

		},

		calculateStampDuty: function(max_property_price) {
			var stamp_duty = 0,
				stamp_duty_land_tax = [0, 0.01, 0.03, 0.04, 0.05, 0.07];
			
			if (max_property_price<124999.99) {
				stamp_duty_land_tax0 = max_property_price * stamp_duty_land_tax[0]
			} 
			else if (max_property_price >= 125000 && max_property_price <=249999.99) {
			 	stamp_duty = max_property_price * stamp_duty_land_tax[1]
			}
			else if (max_property_price >=250000 && max_property_price<=499999.99) {
				stamp_duty = max_property_price * stamp_duty_land_tax[2]
			}
			else if (max_property_price >=500000 && max_property_price<=999999.99) {
				stamp_duty = max_property_price * stamp_duty_land_tax[3]
				}	
			else if (max_property_price >=1000000 && max_property_price<=1999999.99) {
				stamp_duty = max_property_price * stamp_duty_land_tax[4]
			}		
			else if (max_property_price>2000000) {
				stamp_duty = max_property_price * stamp_duty_land_tax[5]
			}

			return stamp_duty;
		},

		calculateMonltyRepayments: function(maximum_mortgage, number_of_payments, interest_rate_monthly) {
			return Math.floor((maximum_mortgage*interest_rate_monthly)/(1-Math.pow(1+interest_rate_monthly,(-1*number_of_payments)))); 
		},

		setModelValues: function(options) {
		
			model.set('maximum_mortgage', options.maximum_mortgage);
			model.set('deposit', options.deposit);
			
			model.set('monthly_repayment_4',  options.monthly_repayment_4.toFixed(2));
			model.set('monthly_repayment_5',  options.monthly_repayment_5.toFixed(2));
			model.set('monthly_repayment_6',  options.monthly_repayment_6.toFixed(2));
			model.set('monthly_repayment_7',  options.monthly_repayment_7.toFixed(2));
			
			model.set('interest_repayment_4', options.interest_repayment_4.toFixed(2));
			model.set('interest_repayment_5', options.interest_repayment_5.toFixed(2));
			model.set('interest_repayment_6', options.interest_repayment_6.toFixed(2));
			model.set('interest_repayment_7', options.interest_repayment_7.toFixed(2));
			model.set('propety_price',        options.propety_price.toFixed(2));
			model.set('deposit_requiered_5',  options.deposit_requiered_5.toFixed(2));
			model.set('deposit_requiered_10', options.deposit_requiered_10.toFixed(2));
			model.set('deposit_requiered_15', options.deposit_requiered_15.toFixed(2));
			model.set('deposit_requiered_20', options.deposit_requiered_20.toFixed(2));
			model.set('deposit_requiered_25', options.deposit_requiered_25.toFixed(2));

			model.set('max_property_price_5',  options.max_property_price_5.toFixed(2));
			model.set('max_property_price_10', options.max_property_price_10.toFixed(2));
			model.set('max_property_price_15', options.max_property_price_15.toFixed(2));
			model.set('max_property_price_20', options.max_property_price_20.toFixed(2));
			model.set('max_property_price_25', options.max_property_price_25.toFixed(2));

			model.set('stamp_duty_5', options.stamp_duty_5.toFixed(2));
			model.set('stamp_duty_10', options.stamp_duty_10.toFixed(2));
			model.set('stamp_duty_15', options.stamp_duty_15.toFixed(2));
			model.set('stamp_duty_20', options.stamp_duty_20.toFixed(2));
			model.set('stamp_duty_25', options.stamp_duty_25.toFixed(2));

			model.set('max_property_price', options.max_property_price.toFixed(2));
			model.set('cal_deposit_precent', options.cal_deposit_precent);
			model.set('ltv', options.ltv.toFixed(2));
			model.set('stamp_duty', options.stamp_duty);

			model.set('maximim_mortgage_under_5', options.maximim_mortgage_under_5);

		}


	});

	return FormField;
});