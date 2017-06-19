/*
 *  Smart Filter by OKViz
 *
 *  Copyright (c) SQLBI. OKViz is a trademark of SQLBI Corp.
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import ISQExpr = powerbi.data.ISQExpr;
import ISemanticFilter = powerbi.data.ISemanticFilter;

module powerbi.extensibility.visual {
 
    interface VisualMeta {
        name: string;
        version: string;
        dev: boolean;
    }

    interface VisualViewModel {
        dataPoints: VisualDataPoint[];
        settings: VisualSettings;
        filters: string[];
    }

    interface VisualDataPoint {
        category?: any;
        displayName: string;
        format?: string;
        selected?: boolean;
        identity?: any;
    }

    interface VisualSettings {
        general: {
            selection?: string;
            filter?: ISemanticFilter;
        };
        search: {
            limit?: number;
            compressMultiple: boolean;
            backFill: Fill;
            fill?: Fill;
            fontSize: number;
            border: boolean;
            observerMode: boolean;
        };

        colorBlind?: {
            vision?: string;
        }
    }

    function defaultSettings(): VisualSettings {

        return {
            general: {},
            search: {
                compressMultiple: false,
                backFill: {solid: { color: "#F2C811" } },
                fontSize: 10,
                border: true,
                observerMode: false
            },

            colorBlind: {
                vision: "Normal"
            }
        };
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): VisualViewModel {

        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.categories);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();
        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
            settings = {
                general: {
                    selection: getValue<string>(objects, "general", "selection", settings.general.selection),
                    filter: getValue<ISemanticFilter>(objects, "general", "filter", settings.general.filter)
                },
                search: {
                    limit: getValue<number>(objects, "search", "limit", settings.search.limit),
                    compressMultiple: getValue<boolean>(objects, "search", "compressMultiple", settings.search.compressMultiple),
                    fontSize: getValue<number>(objects, "search", "fontSize", settings.search.fontSize),
                    backFill: getValue<Fill>(objects, "search", "backFill", settings.search.backFill),
                    fill: getValue<Fill>(objects, "search", "fill", settings.search.fill),
                    border: getValue<boolean>(objects, "search", "border", settings.search.border),
                    observerMode: getValue<boolean>(objects, "search", "observerMode", settings.search.observerMode)
                },

                colorBlind: {
                     vision: getValue<string>(objects, "colorBlind", "vision", settings.colorBlind.vision),
                }
            }

            //Limit some properties
            if (settings.search.limit < 1) settings.search.limit = 1;
        }

    
        //Get DataPoints
        let dataPoints: VisualDataPoint[] = [];
        let filters = (settings.general.selection ? JSON.parse(settings.general.selection) : []);

        if (hasCategoricalData) {

            let dataCategorical = dataViews[0].categorical;
            let category = dataCategorical.categories[0]; 
            let categories = category.values;
            
            for (let i = 0; i < categories.length; i++) {

                let selected = false;
                for (let ii = 0; ii < filters.length; ii++) {
                    if (filters[ii] == JSON.stringify(categories[i])) {
                        selected = true;
                        break;
                    }
                }
               
                dataPoints.push({
                    category: categories[i],
                    displayName: category.source.displayName,
                    format: category.source.format,
                    selected: selected,
                    identity: host.createSelectionIdBuilder().withCategory(category, i).createSelectionId()
                });
            }

        }

        return {
            dataPoints: dataPoints,
            filters: filters,
            settings: settings,
        };
    }

    export class Visual implements IVisual {
        private meta: VisualMeta;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private model: VisualViewModel;
        private tokenizer: Tokenizer;
        private element: JQuery; 

        constructor(options: VisualConstructorOptions) {

            this.meta = {
                name: 'Smart Filter',
                version: '1.1.1',
                dev: false
            };
            console.log('%c' + this.meta.name + ' by OKViz ' + this.meta.version + (this.meta.dev ? ' (BETA)' : ''), 'font-weight:bold');

            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();

            this.model = { dataPoints: [], filters: [], settings: <VisualSettings>{} };

            this.element = $(options.element);
        }
        
        public update(options: VisualUpdateOptions) {

            let dataChanged = (options.type == VisualUpdateType.Data || options.type == VisualUpdateType.All || $('.chart').length == 0);
            if (dataChanged) {
                this.model = visualTransform(options, this.host);
                $('div, svg', this.element).remove();
            }
            if (this.model.dataPoints.length == 0) return;  

            let host = this.host;
            let selectionManager  = this.selectionManager;
            let dateFormat = d3.time.format('%b %e, %Y');

            let margin = {top: 0, left: 0, bottom: 5, right: 0};
            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            let $container, $comboBox, tokenizer: Tokenizer;
            if (dataChanged) {
                
                $container =  $('<div class="chart"></div>').appendTo(this.element);
                $comboBox = $('<select class="tokenCombo"></select>').appendTo($container);

                tokenizer = new Tokenizer($comboBox);
                this.tokenizer = tokenizer;
            } else {
                $container = $('.chart');
                $comboBox = $('.tokenCombo');
                tokenizer = this.tokenizer;
            }

            $container.css({
                'width' :  containerSize.width + 'px',
                'height':  containerSize.height + 'px',
                'margin-top': margin.top + 'px',
                'margin-left': margin.left + 'px'
            });

            if (tokenizer) {
                if (dataChanged) {
                    tokenizer.maxElements = this.model.settings.search.limit || Infinity;
                    tokenizer.compressMultiple = (this.model.settings.search.compressMultiple && this.model.settings.search.observerMode !== true);
                    tokenizer.toggleDropdownArrow();
                    tokenizer.toggleResetter(this.model.settings.search.observerMode !== true);
                    tokenizer.elementsFontSize = PixelConverter.fromPointToPixel(this.model.settings.search.fontSize); 
                    tokenizer.elementsBackColor = this.model.settings.search.backFill.solid.color;
                    tokenizer.elementsColor = (this.model.settings.search.fill ? this.model.settings.search.fill.solid.color : OKVizUtility.autoTextColor(this.model.settings.search.backFill.solid.color));
                    
                    $('li.TokenSearch input').css({
                        'font-size': tokenizer.elementsFontSize + 'px'
                    });
                    $('li.Token').css({
                        'font-size': tokenizer.elementsFontSize + 'px',
                        'background-color': tokenizer.elementsBackColor,
                        'color': tokenizer.elementsColor
                    });

                    $('li.Token a.Close').css({
                        'background-color': tokenizer.elementsBackColor,
                        'color': tokenizer.elementsColor
                    });

           
                    $('.TokensContainer').css('border-width', (this.model.settings.search.border ?'1px' : '0'));

                    let hasSelection = false;
                    let selectionIds = selectionManager.getSelectionIds();

                    for (let i = 0; i < this.model.dataPoints.length; i++) {
                        let dataPoint = this.model.dataPoints[i];
                        let value = (Object.prototype.toString.call(dataPoint.category) === '[object Date]' ? dateFormat(dataPoint.category) : dataPoint.category);

                        let $option = $('<option value="' + value + '">' + value + '</option>')    
                                .appendTo($comboBox);
                        $option.data('datapoint', i);
                        if (dataPoint.selected || this.model.settings.search.observerMode) {
                            $option.attr('selected', 'selected');
                        }
                        if (dataPoint.selected) {
                            hasSelection = true;
                            let doSelect = true;
                            for (let ii = 0; ii < selectionIds.length; ii++) {
                                let selectionId = <visuals.ISelectionId>selectionIds[ii];
                                if (selectionId.getKey() === dataPoint.identity.getKey()) {
                                    doSelect = false;
                                    break;
                                }
                            }
                            if (doSelect) {
                                debugger;
                                selectionManager.select(dataPoint.identity, true);
                                selectionManager.applySelectionFilter();
                            }
                        }
                    }
                    tokenizer.remap();

                    var self = this;
                    let performSelection = function (value, add) {
                        $comboBox.find('option').each(function (i, el) {

                            if ($(this).val().trim() === value.trim()) {

                                let dataPoint = self.model.dataPoints[$(this).data('datapoint')];
                                dataPoint.selected = add;

                                let found = false;
                                for (let i = 0; i < self.model.filters.length; i++) {
                                    if (self.model.filters[i] === JSON.stringify(value)) {
                                        if (!add)
                                            self.model.filters.splice(i, 1)
                                        found = true;
                                        break;
                                    }
                                }

                                if (add && !found)
                                    self.model.filters.push(JSON.stringify(value));
                                
                                //Don't select for add because follow an update 
                                if (!add) {
                                   selectionManager.select(dataPoint.identity, true);
                                   selectionManager.applySelectionFilter();
                                }
                                host.persistProperties({
                                    merge: [{
                                        objectName: 'general',
                                        selector: null,
                                        properties: {
                                            'selection': JSON.stringify(self.model.filters)
                                        },
                                    }]
                                });
                                return false; //Break each
                            }
                        });
                    };

                    tokenizer.onAddToken = function (value, text, e) {
                        performSelection(value, true);
                    };

                    tokenizer.onRemoveToken = function (value, e) {
                        performSelection(value, false);
                    };

                    tokenizer.onClear = function (e) {
                        selectionManager.clear();
                        for (let i = 0; i < self.model.dataPoints.length; i++)
                            self.model.dataPoints[i].selected = false;

                         host.persistProperties({
                            remove: [{
                                objectName: 'general',
                                selector: null,
                                properties: {
                                    'filter': null,
                                    'selection': null
                                },
                            }]
                        });
                    };
                }

                tokenizer.container.width(containerSize.width);
                $('ul.Dropdown').css('max-height', (containerSize.height - $('.TokensContainer').height()) + 'px');
            }

            OKVizUtility.t([this.meta.name, this.meta.version], this.element, options, this.host, {
                'cd1': this.model.settings.colorBlind.vision,
                'cd13': this.model.settings.search.observerMode,
                'cd14': this.model.settings.search.compressMultiple,
                'cd15': this.meta.dev
            });

            //Color Blind module
            OKVizUtility.applyColorBlindVision(this.model.settings.colorBlind.vision, d3.select(this.element[0]));
        }

        public destroy(): void {
           
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var objectName = options.objectName;
            var objectEnumeration: VisualObjectInstance[] = [];

            switch(objectName) {
                
                 case 'search':

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "observerMode": this.model.settings.search.observerMode
                        },
                        selector: null
                    });

                    if (!this.model.settings.search.observerMode) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "compressMultiple": this.model.settings.search.compressMultiple,
                                "limit": this.model.settings.search.limit
                            },
                            selector: null
                        });
                    }

                     objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "backFill": this.model.settings.search.backFill,
                            "fill": this.model.settings.search.fill,
                            "fontSize": this.model.settings.search.fontSize,
                            "border": this.model.settings.search.border
                        },
                        selector: null
                    });

                    
                    break;
                
                case 'colorBlind':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "vision": this.model.settings.colorBlind.vision
                        },
                        selector: null
                    });

                    break;
                
            };

            return objectEnumeration;
        }

    }

    export class Tokenizer {

        public maxElements: number;
        public elementsFontSize: number;
        public elementsBackColor: string;
        public elementsColor: string;
        public compressMultiple: boolean;

        public static KEYS = {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13, 
            ESCAPE: 27,
            ARROW_UP: 38,
            ARROW_DOWN: 40
        };

        private readonly: boolean;
        private select: JQuery;
        private dropdown: JQuery;
        private dropdownArrow: JQuery;
        private dropdownResetter: JQuery;
        public container: JQuery;
        private tokensContainer: JQuery;
        private searchToken: JQuery;
        private searchInput: JQuery;
        private keyTimeout;

        //Events
        public onAddToken: any = function (value, text, e) { };
        public onRemoveToken: any = function (value, e) { };
        public onClear: any = function (e) { };
        public onDropdownAddItem: any = function (value, text, e) { };
        public onDropdownShow: any = function (e) { };
        public onDuplicateToken: any = function (value, text, e) { };

        public constructor(input: JQuery) {

            var $this = this;
            this.readonly = false;
            this.select = input.attr('multiple', 'multiple').css({ margin: 0, padding: 0, border: 0 }).hide();
            this.container = $('<div />')
                .attr('class', this.select.attr('class'))
                .addClass('Tokenize');

            this.dropdown = $('<ul />')
                .addClass('Dropdown');

            this.dropdownArrow = $('<i class="arrow" title="Show all entries" />')
                .on('click', function (e) {
                    e.stopImmediatePropagation();
                    if ($this.dropdown.is(':hidden'))
                        $this.search();
                    else
                        $this.dropdown.hide();
                });

            this.dropdownResetter = $('<span class="slicerHeader"><span class="clear" title= "Clear selections"> </span></span>')
                .on('click', function (e) {
                    e.stopImmediatePropagation();
                    $this.select.find('option:selected').removeAttr('selected').prop('selected', false);
                    $this.searchInput.text('');
                    $this.clear(false);
                });

            this.tokensContainer = $('<ul />')
                .addClass('TokensContainer');

            this.searchToken = $('<li />')
                .addClass('TokenSearch')
                .appendTo(this.tokensContainer);

            this.searchInput = $('<input />')
                .appendTo(this.searchToken);

            if (this.select.prop('disabled')) {
                this.disable();
            }

            this.container
                .append(this.tokensContainer)
                .append(this.dropdown)
                .append(this.dropdownArrow)
                .append(this.dropdownResetter)
                .insertAfter(this.select);

            this.tokensContainer.on('click', function (e) {
                e.stopImmediatePropagation();
                $this.searchInput.get(0).focus();
                if ($this.dropdown.is(':hidden') && $this.searchInput.val() != '') {
                    $this.search();
                }
            });

            this.searchInput.on('blur', function () {
                $this.tokensContainer.removeClass('Focused');
            });

            this.searchInput.on('focus click', function () {
                $this.tokensContainer.addClass('Focused');
            });

            this.searchInput.on('keydown', function (e) {
                $this.resizeSearchInput();
                $this.keydown(e);
            });

            this.searchInput.on('keyup', function (e) {
                $this.keyup(e);
            });

            this.searchInput.on('paste', function () {
                setTimeout(function () { $this.resizeSearchInput(); }, 10);
                setTimeout(function () {
                    var paste_elements = $this.searchInput.val().split(',');
                    if (paste_elements.length > 1) {
                        $.each(paste_elements, function (_, value) {
                            $this.tokenAdd(value.trim(), '');
                        });
                    }
                }, 20);
            });

            $(document).on('click', function () {
                $this.dropdownHide();
                if ($this.maxElements == 1) {
                    if ($this.searchInput.val()) {
                        $this.tokenAdd($this.searchInput.val(), '');
                    }
                }
            });

            this.resizeSearchInput();
            this.remap();
        }

        public toggleReadonly(isReadonly) {
            this.readonly = isReadonly;
            this.container.toggleClass('readonly', isReadonly);
            this.resetPendingTokens();
        }

        public dropdownUpdateColors() {
            $('li', this.dropdown).not('.Selected').css({
                'background': 'none',
                'color': '#fff'
            });
            $('li.Hover, li.Selected', this.dropdown).css({
                'background': this.elementsBackColor,
                'color': this.elementsColor
            });
        }

        public dropdownShow() {
            this.onDropdownShow(this);
            $('ul.Dropdown').hide();
            this.dropdown.show();
        }

        public dropdownPrev() {

            if ($('li.Hover', this.dropdown).length > 0) {
                if (!$('li.Hover', this.dropdown).is('li:first-child')) {
                    $('li.Hover', this.dropdown).removeClass('Hover').prev().addClass('Hover');
                } else {
                    $('li.Hover', this.dropdown).removeClass('Hover');
                    $('li:last-child', this.dropdown).addClass('Hover');
                }
            } else {
               $('li:first', this.dropdown).addClass('Hover');
            }
            this.dropdownUpdateColors();
        }

        public dropdownNext() {

            if ($('li.Hover', this.dropdown).length > 0) {
                if (!$('li.Hover', this.dropdown).is('li:last-child')) {
                    $('li.Hover', this.dropdown).removeClass('Hover').next().addClass('Hover');
                } else {
                    $('li.Hover', this.dropdown).removeClass('Hover');
                    $('li:first-child', this.dropdown).addClass('Hover');
                }
            } else {
                $('li:first', this.dropdown).addClass('Hover');
            }
            this.dropdownUpdateColors();
        }
 
        public dropdownAddItem(value, text?) {

            var alreadySelected = ($('li[data-value="' + value + '"]', this.tokensContainer).length > 0);
            var selectedItems = $('li.Token', this.tokensContainer).length;

            if ((this.compressMultiple && selectedItems > 1) || !alreadySelected) {
                var $this = this;
                var item = $('<li />')
                    .attr('data-value', value)
                    .attr('data-text', text)
                    .css('font-size', this.elementsFontSize + 'px')
                    .html('<span>' + this.escape(text) + '</span>')
                    .on('click', function (e) {
                        e.stopImmediatePropagation();
                        $this.tokenAdd($(this).attr('data-value'), $(this).attr('data-text'));
                    }).on('mouseover', function () {
                        $(this).addClass('Hover');
                        $this.dropdownUpdateColors();
                    }).on('mouseout', function () {
                        $('li', $this.dropdown).removeClass('Hover');
                        $this.dropdownUpdateColors();
                    });

                if (alreadySelected) {
                    item.addClass('Selected');

                    var close_btn = $('<a />')
                        .addClass('Close')
                        .css({
                            'background-color': this.elementsBackColor,
                            'color': this.elementsColor,
                            'padding-top': (((this.elementsFontSize * 1.2) - 10) / 2) + 'px'
                        })
                        .html("&#215;")
                        .on('click', function (e) {
                            e.stopImmediatePropagation();
                            $this.tokenRemove(value);
                        });

                    item.prepend(close_btn);
                }
                this.dropdown.append(item);
               
                this.onDropdownAddItem(value, text, this);
            }

            return this;

        }

        public dropdownHide() {
            this.toggleDropdownArrow();
            this.dropdownReset();
            
            this.dropdown.hide();
        }

        public dropdownReset() {
            this.dropdown.html('');
        }

        public toggleDropdownArrow() {
            var allOptions = $("option", this.select);
            var selOptions = $("option:selected", this.select);
            this.dropdownArrow.toggleClass('disabled', allOptions.length < 1 || allOptions.length === selOptions.length);
            //this.dropdownArrow.toggleClass('disabled', allOptions.length < 1 || allOptions.length === selOptions.length || selOptions.length === this.maxElements);
        }

        public toggleResetter(show: boolean) {
            this.dropdownResetter.toggle(show);
        }

        public resizeSearchInput() {
            this.searchInput.attr('size', Number(this.searchInput.val().length) + 5);
        }

        public resetSearchInput() {
            clearTimeout(this.keyTimeout);
            this.searchInput.val("");
            this.resizeSearchInput();
        }

        public resetPendingTokens() {
            $('li.PendingDelete', this.tokensContainer).removeClass('PendingDelete');
        }

        public keydown(e) {
            

            switch (e.keyCode) {
                case Tokenizer.KEYS.BACKSPACE:
                    var selectedItems = $('li.Token', this.tokensContainer).length;
                    if (this.searchInput.val().length == 0 && !this.readonly && (!this.compressMultiple || selectedItems < 2)) {
                        e.preventDefault();
                        if ($('li.Token.PendingDelete', this.tokensContainer).length) {
                            this.tokenRemove($('li.Token.PendingDelete').attr('data-value'));
                        } else {
                            $('li.Token:last', this.tokensContainer).addClass('PendingDelete');
                        }
                        this.dropdownHide();
                    }
                    break;

                case Tokenizer.KEYS.TAB:
                case Tokenizer.KEYS.ENTER:
                    if ($('li.Hover', this.dropdown).length) {
                        var element = $('li.Hover', this.dropdown);
                        e.preventDefault();
                        this.tokenAdd(element.attr('data-value'), element.attr('data-text'));
                    } else {
                        if (this.searchInput.val()) {
                            e.preventDefault();
                            this.tokenAdd(this.searchInput.val(), '');
                        }
                    }
                    this.resetPendingTokens();
                    break;

                case Tokenizer.KEYS.ESCAPE:
                    this.resetSearchInput();
                    this.dropdownHide();
                    this.resetPendingTokens();
                    break;

                case Tokenizer.KEYS.ARROW_UP:
                    e.preventDefault();
                    this.dropdownPrev();
                    break;

                case Tokenizer.KEYS.ARROW_DOWN:
                    e.preventDefault();
                    this.dropdownNext();
                    break;

                default:
                    this.resetPendingTokens();
                    break;
            }

        }

        public keyup(e) {
            switch (e.keyCode) {
                case Tokenizer.KEYS.TAB:
                case Tokenizer.KEYS.ENTER:
                case Tokenizer.KEYS.ESCAPE:
                case Tokenizer.KEYS.ARROW_UP:
                case Tokenizer.KEYS.ARROW_DOWN:
                    break;

                case Tokenizer.KEYS.BACKSPACE:
                    if (this.searchInput.val()) {
                        this.delaySearch();
                    } else {
                        this.dropdownHide();
                    }
                    break;
                default:
                    if (this.searchInput.val()) {
                        this.delaySearch();
                    }
                    break;
            }
        }

        public delaySearch() {
            clearTimeout(this.keyTimeout);
            var $this = this;
            this.keyTimeout = setTimeout(function() {
                clearTimeout($this.keyTimeout);
                $this.search();
            }, 500);
        }

        public search() {

            
            var $this = this;
            var count = 1;

            /*if ((this.maxElements > 0 && $('li.Token', this.tokensContainer).length >= this.maxElements)) {
                return false;
            }*/

            var str = this.searchInput.val();
            var found = false, regexp = new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
            this.dropdownReset();


            var $options = (this.compressMultiple && str === '' ? $('option', this.select) : $('option', this.select).not(':selected, :disabled'));
            $options.each(function () {
  
                if (regexp.test($(this).html())) {
                    $this.dropdownAddItem($(this).attr('value'), $(this).html());
                    found = true;
                    count++;
                }
                /*} else {
                    return false;
                }*/
            });

            if (found) {
                $('li:first', this.dropdown).addClass('Hover');
                this.dropdownUpdateColors();
                this.dropdownShow();
            } else {
                this.dropdownHide();
            }
        }

        public tokenAdd(value, text, first?) {

            let selectedItems = $('li.Token', this.tokensContainer).length;
            let useMultipleToken = (this.compressMultiple && selectedItems > 0);

            value = value.replace(/["]/g, ''); //.trim();

            if (value == undefined || value == '') {
                return this;
            }

            text = text || value;
            first = first || false;

            if (!this.readonly && this.maxElements > 0 && $('li.Token', this.tokensContainer).length >= this.maxElements) {
                this.resetSearchInput();
                return this;
            }

            var $this = this;
            var close_btn = (this.readonly ? '' : $('<a />')
                .addClass('Close')
                .css({
                    'background-color': this.elementsBackColor,
                    'color': this.elementsColor,
                    'padding-top': (((this.elementsFontSize * 1.5) - 4) / 2) + 'px'
                })
                .html("&#215;")
                .on('click', function (e) {
                    e.stopImmediatePropagation();
                    $this.tokenRemove(value);
                }));

            if ($('option[value="' + value + '"]', this.select).length > 0) {
                if (!first && ($('option[value="' + value + '"]', this.select).attr('selected') === 'selected' ||
                    $('option[value="' + value + '"]', this.select).prop('selected') === true)) {
                    this.onDuplicateToken(value, text, this);
                }
                $('option[value="' + value + '"]', this.select).attr('selected', 'selected').prop('selected', true);

            } else if ($('li[data-value="' + value + '"]', this.dropdown).length > 0) {

                var option = $('<option />')
                    .attr('selected', 'selected')
                    .attr('value', value)
                    .attr('data-type', 'custom')
                    .prop('selected', true)
                    .text(text);
                this.select.append(option);
            } else {
                this.resetSearchInput();
                return this;
            }

            if ($('li.Token[data-value="' + value + '"]', this.tokensContainer).length > 0) {
                return this;
            }

            var item = $('<li />')
                .addClass('Token')
                .attr('data-value', value)
                .append('<span>' + text + '</span>')
                .css({
                    'font-size': this.elementsFontSize + 'px',
                    'background-color': this.elementsBackColor,
                    'color': this.elementsColor
                })
                .prepend(close_btn);

            if (useMultipleToken) 
                item.hide();

            item.insertBefore(this.searchToken);


            if (useMultipleToken) {
                var $tokenMultiple = $('li.TokenMultiple', this.tokensContainer);
                if ($tokenMultiple.length == 0) {
                    $('<li />')
                        .addClass('TokenMultiple')
                        .append('<span>Multiple (' + (selectedItems + 1) + ')</span>')
                        .css({
                            'font-size': this.elementsFontSize + 'px',
                            'font-style': 'italic',
                            'background-color': this.elementsBackColor,
                            'color': this.elementsColor
                        })
                        .insertBefore(this.searchToken);

                } else {
                    $tokenMultiple.html('<span>Multiple (' + (selectedItems + 1) + ')</span>');
                }

                $('li.Token').hide();
            }


            if (!first)
                this.onAddToken(value, text, this);

            this.resetSearchInput();
            this.dropdownHide();

            return this;
        }

        public tokenRemove(value, first?) {

            var option = $('option[value="' + value + '"]', this.select);

            if (option.attr('data-type') == 'custom') {
                option.remove();
            } else {
                option.removeAttr('selected').prop('selected', false);
            }

            $('li.Token[data-value="' + value + '"]', this.tokensContainer).remove();

            first = first || false;
            if (!first) this.onRemoveToken(value, this);

            this.resizeSearchInput();
            this.dropdownHide();

            return this;
        }

        public clear(first?) {
            var $this = this;

            first = first || false;

            $('li.Token', this.tokensContainer).each(function () {
                $this.tokenRemove($(this).attr('data-value'), true);
            });

            if (!first) this.onClear(this);
            this.dropdownHide();

            return this;
        }

        public disable() {
            this.select.prop('disabled', true);
            this.searchInput.prop('disabled', true);
            this.container.addClass('Disabled');

            return this;
        }

        public enable() {
            this.select.prop('disabled', false);
            this.searchInput.prop('disabled', false);
            this.container.removeClass('Disabled');

            return this;
        }

        public remap() {
            var $this = this;
            var tmp = $("option:selected", this.select);
        
            this.clear(true);

            tmp.each(function () {
                $this.tokenAdd($(this).val(), $(this).html(), true);
            });

            return this;
        }

        public toArray() {
            var output = [];
            $("option:selected", this.select).each(function () {
                output.push($(this).val());
            });
            return output;
        }

        public escape(html) {
            return String(html).replace(/[<>]/g, function(s) {
                var map = {
                    "<": "&lt;",
                    ">": "&gt;"
                }
                return map[s];
            });

        }
    }
}