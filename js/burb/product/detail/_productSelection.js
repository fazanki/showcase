/*global Ply, jQuery */
/*jshint eqeqeq: true, curly: true, white: true */

/*

Functionalities:
- to have more than one attribute on a product selection
- to be able dynamically define number of attributes in bcc
- loads all product options in the front end avoiding ajax requests 
  to server side for every click

Notes:
- All the products in the list should have values for all dimensions
- 'Dimension' is the field on the page, Example 'Coat Length' or 'Color'
- 'Dimension Value' is the field options, Example 'long', 'mid', 'short'
- function argument dim is starts with 1 for first field

Related files:
- detailInfoHeritage.jspf - file that generates the markup for fields.
- _info.js - a notification is sent to this code after product selection
- _productSelectionTest.js containers jamsine tests

Author: 
Varun Dev

*/


(function($) {

    Ply.ui.define('pdp_product_selection', {

        options: {
            articleId: 0,
            classSelection: 'value-selected',
            classMoreThanOneValue: 'single-value',
            classiWish: 'iWish',
            classSkuOutOfStock: 'sizeoos',
            notificationRefreshMedia: 'refresh-pdp-media',
            notificationUpdateForms: 'update-forms',
            notificationRebindSizes: 'rebind-sizes',
            productDimensions: {},
            productData: {},
            productHash: {}
        },

        __init: function() {

            var fname = '__init()';

            // Set variables
            this.options.productDimensions = Ply.Globals.pdp_dimensions;
            this.log(this.options.productDimensions, fname, 'pdp_dimensions');

            this.options.productData = Ply.Globals.pdp_products;
            this.log(this.options.productData, fname, 'pdp_products');

            this.options.articleId = Ply.Globals.pdp_articleId;
            this.log('articleId -' + this.options.articleId, fname);

            this.createProductHash();

            // reference for DOM Elements for all values
            this.objects.dimensionValueEls = {};

            // keeps a record of last selected valueIds
            this.lastSelection = []
            this.createDOMElements();
            this.setDefaultSelection();
            this.setSelection();

            this.events();

            return;
        },

        __objects: {
            addToBagButton: '#frmAddToBag .button-add-to-bag',
            articleIdEl: '.product-id span',
            dimensionEls: '.dimension ul',
            dimTemplates: '.template-dim',
            form: '#frmAddToBag',
            formProductIdEl: '#frmAddToBag #productId',
            listPriceEl: '.price-amount',
            quantityCombo: '#frmAddToBag .quantity',
            salePriceEl: '.price-sale',
            sizeSet: '#frmAddToBag .size-set',
            sizeTemplate: '.template-size',
            wishListProductIdEl: '#wishListProductId',
            wishListSection: '.section-wishlist'
        },

        events: function() {
            var self = this;
            // add a handler for all the fields and options
            $('.pdp-product-selector').delegate('.value', 'click', function(e) {
                e.preventDefault();
                self.valueOnClick.call(self, e)
            });
        },

        valueOnClick: function(e) {
            var $el = $(e.currentTarget);
            this.setSelection($el.data('dim'), $el[0].id)
        },

        // creates the DOM elements for all possible values looping through 
        // the dimensions provided from server side
        createDOMElements: function() {
            var self = this,
                dims = self.options.productDimensions,
                d = dimensionDOMObjects = {};

            for (i = 0; i < dims.length; i++) {
                for (j = 0; j < dims[i].length; j++) {
                    var t = self.objects.dimTemplates.eq(i).html();
                    t = self.template(t, dims[i][j]);
                    d[dims[i][j].id] = $(t);
                    self.renderDOMElement(i + 1, d[dims[i][j].id]);
                }
            }
            self.objects.dimensionValueEls = d;
        },

        // Appends hidden DOM elements for all dimension values on init
        renderDOMElement: function(dim, $el) {
            var self = this,
                dims = self.options.dims;

            $el.insertBefore(self.objects.dimTemplates.eq(dim - 1));
            return true;
        },

        // sets the selected product dimension on first load of the page form render.articleId
        setDefaultSelection: function() {
            var product = this.options.productData[this.options.articleId],
                dims = product.dims;

            for (i = 0; i < dims.length; i++) {
                this.lastSelection.push(dims[i].id);
            }
        },

        // inmemory hash is created on load and used for various operations like traversal of the the
        // dimension values matrix and various other operations. It creates javascript object for one product
        // as { 'short': { 'honey': {'standard': product }}}
        createProductHash: function() {
            var productData = this.options.productData,
                productHash = {};

            for (pid in productData) {
                var product = productData[pid],
                    t = {};
                for (i = product.dims.length - 1; i >= 0; i--) {
                    var key = product.dims[i].id;
                    if (i == product.dims.length - 1) {
                        t[key] = product;
                    } else {
                        var a = {}
                        a[key] = t;
                        t = a;
                    }
                }

                // deep merge of the product into the hash. This code can be improved.
                $.extend(true, productHash, t);
            }
            this.options.productHash = productHash;
            this.log(productHash, 'createProductHash', 'Product Hash:');
        },

        // This function is called on user selection of a dimension. It takes a top down approach to dimensions
        // and calculates which dimension values should be shown or hidden and selected or unselected.
        // If no arguments are passed then it set selection to the default selection which is on page load.
        setSelection: function(dim, valueId) {

            var fname = 'setSelection',
                firstRender = false;

            // if no arguments are no passed then it assumes its the first initial selection
            if (dim == undefined && valueId == undefined) {
                dim = 1;
                firstRender = true;
            } else if (!(dim !== undefined && valueId !== undefined)) {
                this.log('ERROR: Invalid arguements (' + dim + ',' + valueId + ')', fname);
                return null;
            }

            var self = this,
                data = this.options.productHash,
                pos = dim - 1;

            // if the user clicks on the already selected value then do nothing
            if (!firstRender && valueId == self.lastSelection[pos]) {
                return null
            }

            // When the user clicks on a dimension value, we have recalculate the available values
            // of the following dimensions after the currently selected dimension. 
            for (j = 0; j < self.lastSelection.length; j++) {
                // for dimension following the current selected dimension
                if (j > pos || firstRender) {
                    valueId = self.setValidSelection(j + 1, self.lastSelection[j], data, firstRender);
                    data = data[valueId];
                }
                // for dimension where use has clicked the value
                else if (j == pos) {
                    valueId = self.setValidSelection(j + 1, valueId, data);
                    data = data[valueId];
                }
                // for dimensions less than where use has clicked, no change required
                else {
                    data = data[self.lastSelection[j]];
                }
            }

            self.afterSelection(data, firstRender);

            //returning data for unit testing
            return data;

        },

        // this function validates the value and check if the product is available, if not then it selects the
        // left most available value.
        setValidSelection: function(dim, valueId, data, firstRender) {
            var self = this,
                values = this.options.productDimensions[dim - 1],
                inStock = [],
                value = {};

            for (var i = 0; i < values.length; i++) {

                if (values[i].id == valueId) {
                    value = values[i];
                }

                // if the value leads to out of stock case
                if (!data[values[i].id]) {
                    // hide the value
                    self.showValue(values[i], false);
                    // if the selected value leads to out of stock case
                    if (valueId == values[i].id) {
                        // the value should be the left most available value. 
                        // Handled after the loop 
                        value = undefined;
                    }
                } else if (data[values[i].id] || firstRender) {
                    self.showValue(values[i]);
                    inStock.push(values[i]);
                }
            }

            // Edge Case: if the selected value is out of stock, then
            if (value == undefined) {
                // value should left most available value and not left most value 
                value = inStock[0];
                valueId = value.id;
            }

            self.selectValue(dim, value, inStock);

            return valueId;
        },

        //tasks to be performed after product selection
        afterSelection: function(product, firstRender) {

            if (!product) return;
            // Refresh Images
            if (!firstRender) {
                Ply.core.notify(this.options.notificationRefreshMedia, this, product);
            }

            this.objects.formProductIdEl.val(product.id);

            this.objects.wishListProductIdEl.val(product.id);

            // Set new sizes
            this.setSizes(product);

            // Change prices
            this.objects.listPriceEl.html(product.listPrice);
            this.objects.salePriceEl.html(product.salePrice);

            // change articleId
            this.objects.articleIdEl.html(product.id);
        },

        // create size/sku options and notify other codes
        setSizes: function(product) {
            var sz = product.sizes,
                set = this.objects.sizeSet,
                t = this.objects.sizeTemplate.html(),
                oos = true;

            set.empty();

            for (var i = 0; i < sz.length; i++) {
                var size = sz[i],
                    t1 = this.template(t, size);

                var el = $(t1),
                    input = el.find('.-radio-input');

                el.addClass('ctg-field-radio');

                if (size.status != 'available') {
                    el.addClass(this.options.classSkuOutOfStock);
                    input.attr('disabled', 'disabled');
                } else {
                    oos = false;
                }

                if (size.inWishList) {
                    el.addClass(this.options.classiWish);
                    input.addClass(this.options.classiWish);
                }

                set.append(el);

            }

            this.showSections(oos);

            Ply.core.notify(this.options.notificationUpdateForms, this.view);
            Ply.core.notify(this.options.notificationRebindSizes);

        },

        showSections: function(outOfStock) {
            if (outOfStock) {
                this.objects.addToBagButton.hide();
                this.objects.wishListSection.hide();
                this.objects.quantityCombo.hide();
            } else {
                this.objects.addToBagButton.show();
                this.objects.wishListSection.show();
                this.objects.quantityCombo.show();
            }
        },

        // Toggles element selection by adding/removing a css class. Also updates the lastSelection variable
        selectValue: function(dim, value, inStock) {

            var pos = dim - 1,
                el = this.objects.dimensionValueEls[value.id],
                title = el.parents('.section').find('.selected-title');

            this.objects.dimensionValueEls[this.lastSelection[pos]].removeClass(this.options.classSelection);
            this.lastSelection[pos] = value.id;
            el.addClass(this.options.classSelection);

            if (value.dimType == "RADIO") {
                el.find('input[type=radio]').attr('checked', 'checked');
                if (inStock.length > 1) {
                    this.objects.dimensionEls.eq(pos).removeClass(this.options.classMoreThanOneValue);
                    title.html('');
                } else {
                    this.objects.dimensionEls.eq(pos).addClass(this.options.classMoreThanOneValue);
                    title.html(value.xlate);
                }
            } else {
                title.html(value.xlate);
            }
        },

        // Shows/Hides the dimension value DOM element.
        showValue: function(value, flag) {
            if (flag == false) {
                this.objects.dimensionValueEls[value.id].css('display', 'none');
            } else {
                this.objects.dimensionValueEls[value.id].css('display', 'block');
            }
        },

        // replaces keys with values in the values map in the template string
        template: function(template, values) {
            for (key in values) {
                var re = new RegExp('\\${' + key + '}', 'g');
                template = template.replace(re, values[key]);
            }
            template = template.replace('data-src', 'src');
            return template;
        },

        log: function(msg, fname, header) {

            fname = fname || '';
            if (header && header.length > 0) {
                Ply.core.log('_productSelection.' + fname + ' - ' + header + ":");
                Ply.core.log(msg);
            } else {
                Ply.core.log('_productSelection.' + fname + ' - ' + msg)
            }

        }
    });

}(jQuery));