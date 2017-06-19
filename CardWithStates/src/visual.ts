/*
 *  Card with States by OKViz
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

import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

module powerbi.extensibility.visual {
    
    interface VisualMeta {
        name: string;
        version: string;
        dev: boolean;
    }

    interface VisualViewModel {
        dataPoints: VisualDataPoint[];
        value?: number;      
        stateValue?: number; 
        target?: number;
        arePercentages?: boolean;
        hasStates?: boolean;
        hasTarget?: boolean;
        settings: VisualSettings;
    }

    interface VisualDataPoint {
        category?: any;
        states?: VisualState[]; 
        displayName: string;
        value: number; 
        stateValue?: number;
        target?: number;
        targetDisplayName?: string;
        format?: string;
        selectionId: any;
    }

    interface VisualState {
        value: number;
        color?: string;
        text?: string;
        icon?: string;
        displayName?: string;
        isTarget: boolean;
        sourcePosition: number;
        selectionId: any;
    }

    interface VisualSettings {
        dataLabel: {
            aggregate?: string;
            alignment: string;
            fill: Fill;
            unit?: number;
            precision?: number; 
            fontFamily: string;
            fontSize: number;
            variance: boolean;
            variancePrecision?: number;
        };
        categoryLabel: {
            show: boolean;
            type: string;
            text?: string;
            fill: Fill;
            fontSize: number;
            wordWrap: boolean;
        };
        states: {
            show: boolean;
            behavior: string;
            showMessages: boolean;
            calculate: string;
            comparison: string;
            baseFill: Fill;
            fontSize: number;
            manualState1?: number;
            manualState1Fill?: Fill;
            manualState1Text?: string;
            manualState1Icon?: string;
            manualState2?: number;
            manualState2Fill?: Fill;
            manualState2Text?: string;
            manualState2Icon?: string;
            manualState3?: number;
            manualState3Fill?: Fill;
            manualState3Text?: string;
            manualState3Icon?: string;
            manualState4?: number;
            manualState4Fill?: Fill;
            manualState4Text?: string;
            manualState4Icon?: string;
            manualState5?: number;
            manualState5Fill?: Fill;
            manualState5Text?: string;
            manualState5Icon?: string;
        };
        trendLine: {
            weight: number;
            interpolation: string;
            fill: Fill;
            curShow: boolean;
            hiShow: boolean;
            hiFill: Fill;
            loShow: boolean;
            loFill: Fill;
        };
       
        colorBlind?: {
            vision?: string;
        }
    }

    function defaultSettings(): VisualSettings {

        return {
            dataLabel: {
                aggregate: 'last',
                alignment: 'middle',
                variance: false,
                fill: {solid: { color: '#333' } },
                unit: 0,
                fontFamily: 'numbers',
                fontSize: 30
            },
            categoryLabel: {
                show: true,
                type: 'measure',
                fill: { solid: { color: '#a6a6a6' } },
                fontSize: 12,
                wordWrap: false
            },
            states: {
                show: true,
                behavior: 'label',
                showMessages: false,
                comparison: '>',
                calculate: 'absolute',
                baseFill: { solid: { color: '#333' } },
                fontSize: 10
            },
            trendLine: {
                weight: 2,
                interpolation: "monotone",
                fill: {solid: { color: "#333" } },
                curShow: true,
                hiShow: false,
                hiFill: {solid: { color: "#399599" } },
                loShow: false,
                loFill: {solid: { color: "#FD625E" } }
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
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();
        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
            settings = {
                dataLabel: {
                    aggregate: getValue<string>(objects, "dataLabel", "aggregate", settings.dataLabel.aggregate),
                    alignment: getValue<string>(objects, "dataLabel", "alignment", settings.dataLabel.alignment),
                    fill: getValue<Fill>(objects, "dataLabel", "fill", settings.dataLabel.fill),
                    unit: getValue<number>(objects, "dataLabel", "unit", settings.dataLabel.unit),
                    precision: getValue<number>(objects, "dataLabel", "precision", settings.dataLabel.precision),
                    fontFamily: getValue<string>(objects, "dataLabel", "fontFamily", settings.dataLabel.fontFamily),
                    fontSize: getValue<number>(objects, "dataLabel", "fontSize", settings.dataLabel.fontSize),
                    variance: getValue<boolean>(objects, "dataLabel", "variance", settings.dataLabel.variance),
                    variancePrecision: getValue<number>(objects, "dataLabel", "variancePrecision", settings.dataLabel.variancePrecision),
                },
                categoryLabel: {
                    show: getValue<boolean>(objects, "categoryLabel", "show", settings.categoryLabel.show),
                    type: getValue<string>(objects, "categoryLabel", "type", settings.categoryLabel.type),
                    text: getValue<string>(objects, "categoryLabel", "text", settings.categoryLabel.text),
                    fill: getValue<Fill>(objects, "categoryLabel", "fill", settings.categoryLabel.fill),
                    fontSize: getValue<number>(objects, "categoryLabel", "fontSize", settings.categoryLabel.fontSize),
                    wordWrap: getValue<boolean>(objects, "categoryLabel", "wordWrap", settings.categoryLabel.wordWrap)
                },
                states: {
                    show: getValue<boolean>(objects, "states", "show", settings.states.show),
                    showMessages: getValue<boolean>(objects, "states", "showMessages", settings.states.showMessages),
                    calculate: getValue<string>(objects, "states", "calculate", settings.states.calculate),
                    comparison: getValue<string>(objects, "states", "comparison", settings.states.comparison),
                    behavior: getValue<string>(objects, "states", "behavior", settings.states.behavior),
                    fontSize: getValue<number>(objects, "states", "fontSize", settings.states.fontSize),
                    baseFill: getValue<Fill>(objects, "states", "baseFill", settings.states.baseFill),

                    manualState1: getValue<number>(objects, "states", "manualState1", settings.states.manualState1),
                    manualState1Fill: getValue<Fill>(objects, "states", "manualState1Fill", settings.states.manualState1Fill),
                    manualState1Text: getValue<string>(objects, "states", "manualState1Text", settings.states.manualState1Text),
                    manualState1Icon: getValue<string>(objects, "states", "manualState1Icon", settings.states.manualState1Icon),

                    manualState2: getValue<number>(objects, "states", "manualState2", settings.states.manualState2),
                    manualState2Fill: getValue<Fill>(objects, "states", "manualState2Fill", settings.states.manualState2Fill),
                    manualState2Text: getValue<string>(objects, "states", "manualState2Text", settings.states.manualState2Text),
                    manualState2Icon: getValue<string>(objects, "states", "manualState2Icon", settings.states.manualState2Icon),

                    manualState3: getValue<number>(objects, "states", "manualState3", settings.states.manualState3),
                    manualState3Fill: getValue<Fill>(objects, "states", "manualState3Fill", settings.states.manualState3Fill),
                    manualState3Text: getValue<string>(objects, "states", "manualState3Text", settings.states.manualState3Text),
                    manualState3Icon: getValue<string>(objects, "states", "manualState3Icon", settings.states.manualState3Icon),

                    manualState4: getValue<number>(objects, "states", "manualState4", settings.states.manualState4),
                    manualState4Fill: getValue<Fill>(objects, "states", "manualState4Fill", settings.states.manualState4Fill),
                    manualState4Text: getValue<string>(objects, "states", "manualState4Text", settings.states.manualState4Text),
                    manualState4Icon: getValue<string>(objects, "states", "manualState4Icon", settings.states.manualState4Icon),

                    manualState5: getValue<number>(objects, "states", "manualState5", settings.states.manualState5),
                    manualState5Fill: getValue<Fill>(objects, "states", "manualState5Fill", settings.states.manualState5Fill),
                    manualState5Text: getValue<string>(objects, "states", "manualState5Text", settings.states.manualState5Text),
                    manualState5Icon: getValue<string>(objects, "states", "manualState5Icon", settings.states.manualState5Icon)
                },
                trendLine: {
                    weight: getValue<number>(objects, "trendLine", "weight", settings.trendLine.weight),
                    interpolation: getValue<string>(objects, "trendLine", "interpolation", settings.trendLine.interpolation),
                    fill: getValue<Fill>(objects, "trendLine", "fill", settings.trendLine.fill),
                    curShow: getValue<boolean>(objects, "trendLine", "curShow", settings.trendLine.curShow),
                    hiShow: getValue<boolean>(objects, "trendLine", "hiShow", settings.trendLine.hiShow),
                    hiFill: getValue<Fill>(objects, "trendLine", "hiFill", settings.trendLine.hiFill),
                    loShow: getValue<boolean>(objects, "trendLine", "loShow", settings.trendLine.loShow),
                    loFill: getValue<Fill>(objects, "trendLine", "loFill", settings.trendLine.loFill)
                },

                colorBlind: {
                     vision: getValue<string>(objects, "colorBlind", "vision", settings.colorBlind.vision)
                }
            }

            //Limit some properties
            if (settings.trendLine.weight < 1) settings.trendLine.weight = 1;
            if (settings.dataLabel.precision < 0) settings.dataLabel.precision = 0;
            if (settings.dataLabel.precision > 5) settings.dataLabel.precision = 5;
            if (settings.dataLabel.variancePrecision < 0) settings.dataLabel.variancePrecision = 0;
            if (settings.dataLabel.variancePrecision > 5) settings.dataLabel.variancePrecision = 5;
          
        }

    
        //Get DataPoints
        let dataPoints: VisualDataPoint[] = [];
        let arePercentages = false;
        let hasTarget = false;
        let hasStates = false;
        let totalValue, totalStateValue, totalTarget;

        if (hasCategoricalData) {
            let dataCategorical = dataViews[0].categorical;
            let category = (dataCategorical.categories ? dataCategorical.categories[0] : null);
            let categories = (category ? category.values : ['']);

            for (let i = 0; i < categories.length; i++) {

                let categoryValue = OKVizUtility.makeMeasureReadable(categories[i]);

                let dataPoint: VisualDataPoint;
                let target, targetDisplayName;
                let stateValue;
                let states: VisualState[] = [];

                for (let ii = 0; ii < dataCategorical.values.length; ii++) {

                    let dataValue = dataCategorical.values[ii];
                 
                    let displayName =  dataValue.source.displayName;
                    let value: any = dataValue.values[i];

                    if (dataValue.source.roles['Values']){ //measure -> Values for legacy compatibility
                        if (value !== null) {
                            if (!totalValue)
                                totalValue = value;
                            else
                                totalValue += value;
                        }
                        dataPoint = {
                            value: value,
                            displayName: displayName,
                            category: categoryValue,
                            format: dataValue.source.format,
                            selectionId: host.createSelectionIdBuilder().withCategory(category, i).createSelectionId()
                        };

                        if (dataValue.source.format && dataValue.source.format.indexOf('%') > -1)
                            arePercentages = true;
                    }

                    if (dataValue.source.roles['TargetValue']){ //statesMeasure -> TargetValue for legacy compatibility
                        if (value !== null) {

                            if (!totalStateValue)
                                totalStateValue = value;
                            else
                                totalStateValue += value;

                            stateValue = value;
                        }
                    }
        
                    let isTarget = (dataValue.source.roles['target']);
                    let isState = (dataValue.source.roles['states']);
                    
                    if (isState || isTarget){

                        if (isTarget) hasTarget = true;
                        if (isState) hasStates = true;

                         if (value !== null) {
                             
                             if (isTarget) {
                                 target = value;
                                 targetDisplayName = displayName;

                                 if (!totalTarget) 
                                    totalTarget = value;
                                else
                                    totalTarget += value;

                                 if (settings.states.calculate == 'modifier' || settings.states.calculate == 'percentage')
                                    value = 0;
                             }

                            let color = getValue<Fill>(dataValue.source.objects, 'states', 'fill', null);

                            let text = getValue<string>(dataValue.source.objects, 'states', 'text', displayName);

                            let icon = getValue<string>(dataValue.source.objects, 'states', 'icon', 'circle');

                             states.push({
                                 value: value,
                                 color: (color ? color.solid.color : null),
                                 text: text,
                                 icon: icon,
                                 displayName: displayName,
                                 isTarget: isTarget,
                                 sourcePosition: states.length,
                                 selectionId: host.createSelectionIdBuilder().withMeasure(dataValue.source.queryName).createSelectionId()
                             });
                         }
                    }
                }

                if (dataPoint) {

                    //Adjust states 
                    if (!hasTarget) settings.states.calculate = 'absolute';

                    if (hasStates) {

                        //Sort states
                        if (settings.states.comparison == '=') {
                            //Do nothing

                        } else {

                            var order = (settings.states.comparison.indexOf('<') > -1 ? 'asc' : 'desc');
                            states.sort(function (a,b) {

                                let pos = (order == 'asc' ? a.value - b.value : b.value - a.value);
                                if (pos) return pos;

                                pos = (order == 'asc' ? a.sourcePosition - b.sourcePosition : b.sourcePosition - a.sourcePosition);

                                return pos;
                            });
                        }

                    } else {

                         //Add manual states
                        for (let s = 1; s <= 5; s++) {
                            let v = "manualState" + s;
                            let f = v + "Fill";
                            let m = v + "Text";
                            let c = v + "Icon";

                            if (settings.states[v] !== null && settings.states[f]) {
                                states.push({
                                    value: settings.states[v],
                                    color: settings.states[f].solid.color,
                                    icon: settings.states[c],
                                    text: settings.states[m],
                                    displayName: null,
                                    isTarget: false,
                                    sourcePosition: s,
                                    selectionId: null
                                });
                            }
                        }
  
                    }

                    //Move target to the last position
                    if (hasTarget) {
                        for (let s = 0; s < states.length; s++) {
                            if (states[s].isTarget){
                                let spliced = states.splice(s, 1);
                                states = states.concat(spliced);
                                break;
                            }
                        }
                    } 

                    //Assign special palette to measure bound
                    if (hasStates) {
                        let statesPalette = OKVizUtility.defaultPaletteForStates(states.length, settings.states.comparison);
                        for (let s = 0; s < states.length; s++) {
                            if (!states[s].color)
                                states[s].color = statesPalette[s];
                        }
                    }

                    dataPoint.states = states;
                    dataPoint.stateValue = (stateValue !== null ? stateValue : dataPoint.value);
                    dataPoint.target = target;
                    dataPoint.targetDisplayName = targetDisplayName;
                    dataPoints.push(dataPoint);
                }
            }

        }  

        return {
            dataPoints: dataPoints,
            value: totalValue,
            stateValue: totalStateValue,
            target: totalTarget,
            arePercentages: arePercentages,
            hasTarget: hasTarget,
            hasStates: hasStates,
            settings: settings,
        };
    }

    export class Visual implements IVisual {
        private meta: VisualMeta;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private tooltipServiceWrapper: tooltip.ITooltipServiceWrapper;
        private model: VisualViewModel;

        private element: d3.Selection<HTMLElement>;
        private window: any;
 
        constructor(options: VisualConstructorOptions) {
            
            this.meta = {
                name: 'Card with States',
                version: '1.3.3',
                dev: false
            };
            console.log('%c' + this.meta.name + ' by OKViz ' + this.meta.version + (this.meta.dev ? ' (BETA)' : ''), 'font-weight:bold');

            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, options.element);
            this.model = { dataPoints: [], hasStates: false, hasTarget: false, settings: <VisualSettings>{} };

            this.element = d3.select(options.element);
        }
             
        public update(options: VisualUpdateOptions) {

            this.model = visualTransform(options, this.host);
            this.element.selectAll('div, svg').remove();
            if (this.model.dataPoints.length == 0) return;

            let selectionManager  = this.selectionManager;
            let dataPoint = this.model.dataPoints[0]; 
            
            let value = (this.model.dataPoints.length > 1 && this.model.settings.dataLabel.aggregate == 'sum' ? this.model.value : dataPoint.value);
            let stateValue = (this.model.dataPoints.length > 1 && this.model.settings.dataLabel.aggregate == 'sum' ? this.model.stateValue : dataPoint.stateValue);   
            if (stateValue == null) stateValue = value; //State Measure has been not defined, so we use Measure

            let target = (this.model.dataPoints.length > 1 && this.model.settings.dataLabel.aggregate == 'sum' ? this.model.target : dataPoint.target);

            let formatter = OKVizUtility.Formatter.getFormatter({
                format: dataPoint.format,
                value: this.model.settings.dataLabel.unit,
                formatSingleValues: (this.model.settings.dataLabel.unit == 0),
                allowFormatBeautification: true,
                precision: this.model.settings.dataLabel.precision,
                displayUnitSystemType: 2, //Default = 0, Verbose = 1, WholeUnits = 2, DataLabels = 3
            }); 
     
            //States
            let stateIndex = -1;
            if (this.model.settings.states.show) {

                let diff = (target ? (stateValue - target) : 0);
                let variance = (target ? (this.model.arePercentages ? diff : (diff / target)) : 0);

                for (let i = 0; i < dataPoint.states.length; i++){

                    let state = dataPoint.states[i];

                    let valueToCompare = stateValue;
                    if (this.model.settings.states.calculate == 'modifier') {
                        valueToCompare = diff;
                    } else if (this.model.settings.states.calculate == 'percentage') {
                        valueToCompare = variance;
                    }

                    let found = false;
                    if (this.model.settings.states.comparison == '>') {
                        found = (valueToCompare > state.value);

                    } else if (this.model.settings.states.comparison == '>=') {
                        found = (valueToCompare >= state.value);

                    } else if (this.model.settings.states.comparison == '<') {
                        found = (valueToCompare < state.value);

                    } else if (this.model.settings.states.comparison == '<=') {
                        found = (valueToCompare <= state.value);

                    } else { //=
                        found = (valueToCompare == state.value);

                    }

                    //State found -> exit
                    if (found) {
                        stateIndex = i;
                        break;
                    }
                }
            } 

            let margin = {top: 0, left: 0, bottom: 0, right: 0};
            let padding = {top: 0, left: 5, bottom: 0, right: 5};
            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            let container =  this.element
                .append('div')
                .classed('chart', true)
                .style({
                    'width' :  containerSize.width + 'px',
                    'height':  containerSize.height + 'px',
                    'margin-top': margin.top + 'px',
                    'margin-left': margin.left + 'px'
                });
            
             if (stateIndex > -1) {
                if (this.model.settings.states.behavior == 'backcolor') {
                    container.style('background-color', dataPoint.states[stateIndex].color); 
                }
             }
   
            let svgContainer = container
                .append('svg')
                .attr('width', containerSize.width)
                .attr('height', containerSize.height)
                .append('g');
             
            //Data Label
            let dataLabelFontSize = PixelConverter.fromPoint(this.model.settings.dataLabel.fontSize);
            let dataLabelFontFamily = (this.model.settings.dataLabel.fontFamily == "numbers" ? "'wf_standard-font',helvetica,arial,sans-serif" : "'wf_segoe-ui_Semibold', sans-serif");

            let dataLabelValue = TextUtility.getTailoredTextOrDefault({
                text: formatter.format(value),
                fontSize: dataLabelFontSize,
                fontFamily: dataLabelFontFamily  
            }, containerSize.width - padding.left - padding.right);  
           
            let dataLabelColor = (this.model.settings.states.show ?  this.model.settings.states .baseFill : this.model.settings.dataLabel.fill).solid.color;
            if (stateIndex > -1) {
                if (this.model.settings.states.behavior == 'forecolor' || this.model.settings.states.behavior == 'label') {    
                    dataLabelColor = dataPoint.states[stateIndex].color;
                } else if (this.model.settings.states.behavior == 'backcolor') {
                    dataLabelColor = OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color);
                }
            }    

            let incrementalPos = {
                x: ((containerSize.width - padding.left - padding.right) / 2),
                y: padding.top + (this.model.settings.dataLabel.fontFamily == "numbers" ? 15 : 10)
            };

            let dataLabel = svgContainer.append('text')
                .attr('x', incrementalPos.x)
                .attr('y', incrementalPos.y)
                //.attr('dominant-baseline', 'hanging')
                .style({
                    'font-size': dataLabelFontSize,
                    'fill': dataLabelColor,
                    'font-family': dataLabelFontFamily,
                    'text-anchor': 'middle',
                    'border': '1px solid #000'
                }) 
                .text(dataLabelValue); 
                
            let dataLabelNode = <any>dataLabel.node();
            let dataLabelBBox = dataLabelNode.getBBox();

            dataLabel.attr('y', incrementalPos.y + (dataLabelBBox.height / 2));

            //Variance
            if (this.model.settings.dataLabel.variance && this.model.hasTarget) {

                let variance = ((value - target) / (this.model.arePercentages ? 1 : target));
                let varianceValue = (variance > 0 ? '+':'') + ((variance * 100).toFixed(this.model.settings.dataLabel.variancePrecision == null ? 2: this.model.settings.dataLabel.variancePrecision)) + '%';
                let varianceFontSize = PixelConverter.fromPoint(this.model.settings.dataLabel.fontSize - ((this.model.settings.dataLabel.fontFamily == 'numbers' ? 6 : 2)));
                let varianceWidth = TextUtility.measureTextWidth({
                    text: varianceValue,
                    fontSize: varianceFontSize,
                    fontFamily: dataLabelFontFamily
                });

                let varianceColor = (this.model.settings.states.show ?  this.model.settings.states .baseFill : this.model.settings.dataLabel.fill).solid.color;
                if (stateIndex > -1) {
                    if (this.model.settings.states.behavior == 'variance' || this.model.settings.states.behavior == 'forecolor') {
                        varianceColor = dataPoint.states[stateIndex].color;
                    } else if (this.model.settings.states.behavior == 'backcolor') {
                        varianceColor = OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color);
                    }
                }

                dataLabel.attr('transform', 'translate(' + (-(varianceWidth/2) - 4) + ',0)');

                
                svgContainer.append('text')
                    .attr('x', incrementalPos.x + (dataLabelBBox.width / 2) + 8)
                    .attr('y', incrementalPos.y + (dataLabelBBox.height / 2))
                    //.attr('dominant-baseline', 'hanging')
                    .style({
                        'font-size': varianceFontSize,
                        'fill': varianceColor,
                        'font-family': dataLabelFontFamily,
                        'text-anchor': 'middle'
                    })
                    .text(varianceValue);
                
            }

            
            incrementalPos.y += dataLabelBBox.height - (PixelConverter.fromPointToPixel(this.model.settings.dataLabel.fontSize) / (this.model.settings.dataLabel.fontFamily == 'numbers' ? 4 : 3));

            //Category Label
            if (this.model.settings.categoryLabel.show) {

                let categoryLabelFontSize = PixelConverter.fromPoint(this.model.settings.categoryLabel.fontSize);

                let rawCategoryLabelValue = dataPoint.displayName;
                if (this.model.settings.categoryLabel.type == 'category') {
                    rawCategoryLabelValue = dataPoint.category;
                } else if (this.model.settings.categoryLabel.type == 'custom') {
                    rawCategoryLabelValue = this.model.settings.categoryLabel.text;
                } else {
                    if (this.model.settings.dataLabel.variance && this.model.hasTarget)
                        rawCategoryLabelValue += ' (vs. ' +  dataPoint.targetDisplayName + ')';
                }

                let categoryLabelValue = rawCategoryLabelValue;
                if (!this.model.settings.categoryLabel.wordWrap && rawCategoryLabelValue && rawCategoryLabelValue != '') {
                    categoryLabelValue = TextUtility.getTailoredTextOrDefault({
                        text: rawCategoryLabelValue,
                        fontSize: categoryLabelFontSize,
                        fontFamily: 'sans-serif'
                    }, containerSize.width - padding.left - padding.right);  
                }

                let categoryLabel = svgContainer.append('text')
                    .attr('x', incrementalPos.x)
                    .attr('y', incrementalPos.y) 
                    //.attr('dominant-baseline', 'hanging')
                    .style({
                        'font-size': categoryLabelFontSize,
                        'fill': (stateIndex > -1 && this.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  this.model.settings.categoryLabel.fill.solid.color),
                        'text-anchor': 'middle'
                    })
                    .text(categoryLabelValue);


                let categoryLabelNode = <any>categoryLabel.node();
                let categoryLabelBBox = categoryLabelNode.getBBox();

                categoryLabel.attr('y', incrementalPos.y + (categoryLabelBBox.height / 2)) 

                if (this.model.settings.categoryLabel.wordWrap) {

                    TextUtility.wrapAxis(categoryLabel, containerSize.width - padding.left - padding.right);
                    
                }

                incrementalPos.y += categoryLabelNode.getBBox().height;
            }

            //Message label
            
            if (stateIndex > -1 && this.model.settings.states.showMessages && dataPoint.states[stateIndex].text && dataPoint.states[stateIndex].text !== '') {
                incrementalPos.y += 5;

                let iconSize = (!dataPoint.states[stateIndex].icon || dataPoint.states[stateIndex].icon == '' ? 0 : ((PixelConverter.fromPointToPixel(this.model.settings.states.fontSize)/2)));

                let messageLabelFontSize = PixelConverter.fromPoint(this.model.settings.states.fontSize);
                let messageLabelValue = TextUtility.getTailoredTextOrDefault({
                        text: dataPoint.states[stateIndex].text,
                        fontSize: messageLabelFontSize,
                        fontFamily: 'sans-serif'
                    }, containerSize.width - padding.left - padding.right); 

                let messageLabel = svgContainer.append('text')
                    .attr('x', incrementalPos.x + iconSize)
                    .attr('y', incrementalPos.y)
                    //.attr('dominant-baseline', 'hanging')
                    .style({
                        'font-size': messageLabelFontSize,
                        'fill': (this.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  '#a6a6a6'),
                        'text-anchor': 'middle'
                    })
                    .text(messageLabelValue);

                
                let messageLabelNode = <any>messageLabel.node();
                let messageBBox = messageLabelNode.getBBox();
                messageLabel.attr('y', incrementalPos.y + (messageBBox.height / 2))

                if (dataPoint.states[stateIndex].icon == 'circle') {
                    //iconSize += 2;
                    svgContainer
                        .append('circle')
                        .attr('cx', incrementalPos.x - (messageBBox.width / 2) - (iconSize / 2))
                        .attr('cy', incrementalPos.y + (messageBBox.height / 2) - (iconSize / 2))
                        .attr('r', (iconSize / 2))
                        .attr('fill', (this.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  dataPoint.states[stateIndex].color));

                } else if (dataPoint.states[stateIndex].icon == 'up' || dataPoint.states[stateIndex].icon == 'down') {

                    svgContainer
                        .append('path')
                        .attr("transform", function(d) { return "translate(" + (incrementalPos.x - (messageBBox.width / 2) - (iconSize / 2)) + "," + (incrementalPos.y + (messageBBox.height / 2) - (iconSize/2)) + ")"; })
                        .attr("d", d3.svg.symbol().type("triangle-" + dataPoint.states[stateIndex].icon))
                        .attr('fill', (this.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  dataPoint.states[stateIndex].color));

                } else if (dataPoint.states[stateIndex].icon == 'good') {
                    //TODO
                } else if (dataPoint.states[stateIndex].icon == 'bad') {
                    //TODO
                }

                incrementalPos.y += messageBBox.height;
            }

            //Trend line
             let self = this;
            if (this.model.dataPoints.length > 1) {

                //We use this method and not d3.extent because we need to know hi/low index points
                //d3.extent(this.model.dataPoints, function(d) { return d.value; });
                let topValue, bottomValue;
                for (let ii = 0; ii < this.model.dataPoints.length; ii++){
                    if (!topValue || this.model.dataPoints[ii].value > topValue.value) {
                        topValue = { index: ii, value: this.model.dataPoints[ii].value, category: this.model.dataPoints[ii].category };
                    }
                    if (!bottomValue || this.model.dataPoints[ii].value < bottomValue.value) {
                        bottomValue = { index: ii, value: this.model.dataPoints[ii].value, category: this.model.dataPoints[ii].category };
                    }
                }
                let ray = this.model.settings.trendLine.weight * 2;

                let trendlineHeight = containerSize.height - incrementalPos.y - 10 - padding.bottom - ray;
                if (trendlineHeight > 1) {
                    
                    let trendlineContainer = svgContainer.append('g')
                                                .style('pointer-events', 'all');

                    let x = d3.scale.linear()
                        .domain([this.model.dataPoints.length - 1, 0])
                        .range([ray, containerSize.width - padding.left - padding.right - ray]);
                    
                    let y = d3.scale.linear()
                        .domain([bottomValue.value, topValue.value]) 
                        .range([containerSize.height - padding.bottom - ray, incrementalPos.y + 10]);

                    let line = d3.svg.line()
                        .x(function(d: any, j: any) { 
                            return x(j); 
                        })
                        .y(function(d: any) { 
                            return y(d.value); 
                        })
                        .interpolate(this.model.settings.trendLine.interpolation);

                    trendlineContainer.append("path").data([this.model.dataPoints])
                        .classed('sparkline', true)
                        .attr("d", <any>line)
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-width', this.model.settings.trendLine.weight)
                        .attr('stroke', (stateIndex > -1 && this.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  this.model.settings.trendLine.fill.solid.color))
                        .attr('fill', 'none');
                    
                     if (this.model.settings.trendLine.curShow) {
                         let color = (stateIndex > -1 && this.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  this.model.settings.trendLine.fill.solid.color);

                        trendlineContainer.append('circle')
                            .classed('point fixed', true)
                            .attr('cx', x(0))
                            .attr('cy', y(dataPoint.value))
                            .attr('r', ray)
                            .attr('fill', color);
                            
                        }

                    if (stateIndex > -1 && this.model.settings.states.behavior == 'backcolor') {
                        //Do nothing
                        //Coding Horror? :)

                    } else {
                        if (this.model.settings.trendLine.hiShow) {
                            let color = this.model.settings.trendLine.hiFill.solid.color;
                            trendlineContainer.append('circle')
                                .classed('point fixed', true)
                                .attr('cx', x(topValue.index))
                                .attr('cy', y(topValue.value))
                                .attr('r', ray)
                                .attr('fill', color);  
                        }


                        if (this.model.settings.trendLine.loShow) {
                            let color = this.model.settings.trendLine.loFill.solid.color;
                            trendlineContainer.append('circle')
                                .classed('point fixed', true)
                                .attr('cx', x(bottomValue.index))
                                .attr('cy', y(bottomValue.value))
                                .attr('r', ray)
                                .attr('fill', color);  
                        }
                    }

                    //Tooltips
                    let self = this;
                    let hidePointTimeout;
                    trendlineContainer.on('mousemove', function(){

                        clearTimeout(hidePointTimeout);

                        let coord = [0, 0];
                        coord = d3.mouse(this);

                        let foundIndex = -1;
                        for (let ii = 0; ii < self.model.dataPoints.length; ii++) {
                            if (coord[0] == x(ii)) {
                                foundIndex = ii;
                                break;
                            } else if (coord[0] < x(ii) - ((x(ii) - x(ii-1))/2)) {
                                foundIndex = ii;
                            } else {
                                break;
                            }
                        }

                        let circle = trendlineContainer.select('.point:not(.fixed):not(.keep)');
                        if (foundIndex == -1) {
                            circle.remove();
                        } else {
                            if (circle.empty())
                                circle = trendlineContainer.append('circle').classed('point', true);
                            
                            let val = self.model.dataPoints[foundIndex].value;
                            let color = (stateIndex > -1 && self.model.settings.states.behavior == 'backcolor' ? OKVizUtility.autoTextColor(dataPoint.states[stateIndex].color) :  self.model.settings.trendLine.fill.solid.color);
                            if (self.model.settings.trendLine.hiShow && topValue.value == val) {
                                color = self.model.settings.trendLine.hiFill.solid.color;

                            } else if  (self.model.settings.trendLine.loShow && bottomValue.value == val) {
                                color = self.model.settings.trendLine.loFill.solid.color;
                            }

                            circle
                                .attr('cx', x(foundIndex))
                                .attr('cy', y(val))
                                .attr('r', ray)
                                .attr('fill', color)  
                                .on('click', function(d) {
                                    selectionManager.select(self.model.dataPoints[foundIndex].selectionId).then((ids: ISelectionId[]) => {
                                        
                                        let selection = (ids.length > 0);
                                        d3.selectAll('.point.fixed').attr({ 'fill-opacity': (selection ? 0.3 : 1) });
                                        d3.selectAll('.sparkline').attr({ 'stroke-opacity': (selection ? 0.3 : 1) });
                                        d3.selectAll('.point.keep').classed('keep', false);

                                        if (selection) 
                                            d3.select(this).classed('keep', true).attr({ 'fill-opacity': 1 });

                                        d3.selectAll('.point:not(.fixed):not(.keep)').remove();
                                    });

                                    (<Event>d3.event).stopPropagation();
                                });
            
                                  
                            self.tooltipServiceWrapper.addTooltip(circle, 
                                function(eventArgs: TooltipEventArgs<TooltipEnabledDataPoint>){
                                    return [<VisualTooltipDataItem>{
                                        header: self.model.dataPoints[foundIndex].category,
                                        displayName: dataPoint.displayName,
                                        value: formatter.format(val),
                                        color: (color.substr(1, 3) == '333' ? '#000' : color)
                                    }]; 
                                }, null, true
                            );
                        }
 
                    });
                    trendlineContainer.on('mouseenter', function(){ 
                        clearTimeout(hidePointTimeout);
                    });
                    trendlineContainer.on('mouseleave', function(){ 
                        hidePointTimeout = setTimeout(function(){
                            svgContainer.selectAll('.point:not(.fixed):not(.keep)').remove();
                        }, 500);
                    });
                }


            } else {

                if (this.model.settings.dataLabel.alignment == 'middle') {
                    svgContainer.attr('transform', 'translate(0, ' + (((containerSize.height -padding.bottom  - incrementalPos.y) / 2)-margin.top) + ')');

                }

            }
            
            OKVizUtility.t([this.meta.name, this.meta.version], this.element, options, this.host, {
                'cd1': this.model.settings.colorBlind.vision, 
                'cd2': (this.model.settings.states.show ?  this.model.dataPoints[0].states.length : 0),
                'cd3': this.model.settings.states.comparison, 
                'cd5': this.model.hasStates, 
                'cd10': this.model.settings.dataLabel.variance, 
                'cd11': (this.model.dataPoints.length > 1),
                'cd15': this.meta.dev
            }); 
                
            //Color Blind module
            OKVizUtility.applyColorBlindVision(this.model.settings.colorBlind.vision, this.element);
        }    

        public destroy(): void {

        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var objectName = options.objectName;
            var objectEnumeration: VisualObjectInstance[] = [];

            switch(objectName) {
                
                 case 'dataLabel':

                    if (this.model.dataPoints.length > 1) {
                         objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "aggregate": this.model.settings.dataLabel.aggregate
                            },
                            selector: null
                        });
                    } else {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "alignment": this.model.settings.dataLabel.alignment
                            },
                            selector: null
                        });
                    }

                    if (!this.model.settings.states.show) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "fill": this.model.settings.dataLabel.fill
                            },
                            selector: null
                        });
                    }

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "unit": this.model.settings.dataLabel.unit,
                            "precision": this.model.settings.dataLabel.precision,
                            "fontFamily": this.model.settings.dataLabel.fontFamily,
                            "fontSize": this.model.settings.dataLabel.fontSize
                        },
                        selector: null
                    });
  
                    if (this.model.hasTarget) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "variance": this.model.settings.dataLabel.variance
                            },
                            selector: null
                        });
                    }

                    if (this.model.settings.dataLabel.variance) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "variancePrecision": this.model.settings.dataLabel.variancePrecision
                            },
                            selector: null
                        });
                    }

                    break;

                case 'categoryLabel': 

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.categoryLabel.show,
                            "fill": this.model.settings.categoryLabel.fill,
                            "fontSize": this.model.settings.categoryLabel.fontSize,
                            "wordWrap": this.model.settings.categoryLabel.wordWrap,
                            "type": this.model.settings.categoryLabel.type
                        },
                        selector: null
                    });

                    if (this.model.settings.categoryLabel.type == 'custom') {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "text": this.model.settings.categoryLabel.text
                            },
                            selector: null
                        });
                    }

                    break;

                case 'states':

                     objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.states.show,
                            "behavior": this.model.settings.states.behavior,
                            "showMessages": this.model.settings.states.showMessages
                            
                        },
                        selector: null
                    });

                     if (this.model.settings.states.showMessages) {
                         objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "fontSize": this.model.settings.states.fontSize
                            },
                            selector: null
                        });
                    }

                    if (this.model.hasTarget) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "calculate": this.model.settings.states.calculate
                            },
                            selector: null
                        });
                    }

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "comparison": this.model.settings.states.comparison,
                            "baseFill": this.model.settings.states.baseFill
                        },
                        selector: null
                    });

                     if (!this.model.hasStates) {

                        for (let i = 1; i <= 5; i++) {

                            let v = "manualState" + i;
                            let f = v + "Fill";
                            let m = v + "Text";
                            let c = v + "Icon";

                            let s: any = {};
                            s[f] = this.model.settings.states[f];
                            s[v] = this.model.settings.states[v];
                            if (this.model.settings.states.showMessages) {
                                s[m] = this.model.settings.states[m];
                                s[c] = this.model.settings.states[c];
                            }
                            objectEnumeration.push({
                                objectName: objectName,
                                properties: s,
                                selector: null
                            });
                        } 
                    }

                    if (this.model.dataPoints.length > 0) {
                        for(let i = 0; i < this.model.dataPoints[0].states.length; i++) {
                            let state = this.model.dataPoints[0].states[i];
                            if (state.selectionId) {
                                objectEnumeration.push({
                                    objectName: objectName,
                                    displayName: state.displayName + (state.isTarget ? ' (target)' : ''),
                                    properties: {
                                        "fill": { solid: { color: state.color } }
                                    },
                                    selector: state.selectionId.getSelector()
                                });

                                if (this.model.settings.states.showMessages) {

                                    objectEnumeration.push({
                                        objectName: objectName,
                                        displayName: state.displayName + " message",
                                        properties: {
                                            "text": state.text
                                        },
                                        selector: state.selectionId.getSelector()
                                    }); 

                                    objectEnumeration.push({
                                        objectName: objectName,
                                        displayName: state.displayName + " icon",
                                        properties: {
                                            "icon": state.icon
                                        },
                                        selector: state.selectionId.getSelector()
                                    });

                                }
                            }
                        }
                    }
 
                    break;
  
                case 'trendLine':  

                    if (this.model.dataPoints.length > 1) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "interpolation": this.model.settings.trendLine.interpolation,
                                "weight": this.model.settings.trendLine.weight,
                                "fill": this.model.settings.trendLine.fill,
                                "curShow": this.model.settings.trendLine.curShow,
                                "hiShow": this.model.settings.trendLine.hiShow
                            },
                            selector: null
                        });

                        if (this.model.settings.trendLine.hiShow) {
                            objectEnumeration.push({
                                objectName: objectName,
                                properties: {
                                    "hiFill": this.model.settings.trendLine.hiFill
                                },
                                selector: null
                            });
                        }

                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "loShow": this.model.settings.trendLine.loShow
                            },
                            selector: null
                        });

                        if (this.model.settings.trendLine.loShow) {
                            objectEnumeration.push({
                                objectName: objectName,
                                properties: {
                                    "loFill": this.model.settings.trendLine.loFill
                                },
                                selector: null
                            });
                        }
                    }

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
}