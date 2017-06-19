/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
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

module powerbi.extensibility.visual {
    export var tableChartScorecardProps = {
        thresholds: {
            targetValue: <DataViewObjectPropertyIdentifier>{ objectName: 'values', propertyName: 'targetValue' },
            satisfactoryPercent: <DataViewObjectPropertyIdentifier>{ objectName: 'values', propertyName: 'satisfactoryPercent' },
            goodPercent: <DataViewObjectPropertyIdentifier>{ objectName: 'values', propertyName: 'goodPercent' },
            maximumPercent: <DataViewObjectPropertyIdentifier>{ objectName: 'values', propertyName: 'maximumPercent' },
        },

    };

    interface VisualViewModel {
        headers: HeaderViewModel[];
        allSeries: AllSeriesViewModel[];
        tableChartScorecardSettings: VisualSettings;
    }

    interface VisualSettings {
        thresholds: {
            targetValue: number;
            satisfactoryPercent: number;
            goodPercent: number;
            maximumPercent: number;
        }
    }

    export interface AllSeriesViewModel {
        value: any[];
    }

    export interface HeaderViewModel {
        value: string;
    }


    interface VisualViewModel {
        headers: HeaderViewModel[];
        allSeries: AllSeriesViewModel[];
        tableChartScorecardSettings: VisualSettings;
    }

    export var TableChartScorecardRoleNames = {
        value: 'Value',
        targetValue: 'TargetValue',
        satisfactoryValue: 'Satisfactory',
        goodValue: 'Good',
        maxValue: 'Maximum'
    };


    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): VisualViewModel {


        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);


        //Get Settings
        let settings: VisualSettings = defaultSettings();

        let viewModel: VisualViewModel = {
            headers: [],
            allSeries: [],
            tableChartScorecardSettings: settings,
        }

        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
           
            if (objects) {
                settings.thresholds.targetValue = getValue<number>(objects, "thresholds", "targetValue", settings.thresholds.targetValue);
                settings.thresholds.satisfactoryPercent = getValue<number>(objects, "thresholds", "satisfactoryPercent", settings.thresholds.satisfactoryPercent);
                settings.thresholds.goodPercent = getValue<number>(objects, "thresholds", "goodPercent", settings.thresholds.goodPercent);
                settings.thresholds.maximumPercent = getValue<number>(objects, "thresholds", "maximumPercent", settings.thresholds.maximumPercent);
            }
        }

        let dataView = dataViews[0];

        if (dataView) {
            var categorical = dataView.categorical;
            if (categorical) {
              

                var categories = categorical.categories;

                var formatString = dataView.metadata.columns[0].format;
                var header = new Object();

                if (categories && categorical.values && categories.length > 0 && categorical.values.length > 0) {
                    for (var i = 0, catLength = categories[0].values.length; i < catLength; i++) {
                        if (i == 0) {
                            viewModel.headers[0] = { value: '' };
                        }

                        var item = new Array;
                        var bulletDetail = new Array;
                        var valueDetail = new Array;
                        var max = 0;
                        var maximum = 0;
                        var satisfactory = 0;
                        var good = 0;
                        let value = 0;
                        var targetValue = 0;

                        // Row Header
                        item[0] = categories[0].values[i].toString();

                        // Column Headers
                        viewModel.headers[0] = { value: '' };
                        viewModel.headers[1] = { value: 'Actual Vs. Target' };
                        viewModel.headers[2] = { value: 'Actual' };

                        
                        var colIdx = 0;
                        for (var k = 0, seriesLength = categorical.values.length; k < seriesLength; k++) {
                            // Default data based on series ordinal because sometimes roles not matching                       
                            //var col = dataView.metadata.columns[k]; 

                            var col = categorical.values[colIdx].source;
                            viewModel.headers[2] = { value: categorical.values[0].source.displayName };

                            //value = categorical.values[0].values[i];   
                            //max =  Math.max.apply(null, categorical.values[0].values);
                            //if (categorical.values.length > 1)
                            //	targetValue	 = categorical.values[1].values[i]; 

                            if (col && col.roles) {
                                if (col.roles['Value']) { // we are matching the role and populating value                                                                            
                                    value = Number(categorical.values[colIdx].values[i]);
                                    value.toFixed(2);
                                    max = Math.max.apply(null, categorical.values[colIdx].values);
                                    max.toFixed(2);
                                    viewModel.headers[2] = { value: categorical.values[colIdx].source.displayName };
                                } else if (col.roles['TargetValue']) {
                                    targetValue = Number(categorical.values[colIdx].values[i]);
                                    targetValue.toFixed(2);
                                } else if (col.roles['Maximum']) {
                                    maximum = Number(categorical.values[colIdx].values[i]);
                                } else if (col.roles['Satisfactory']) {
                                    satisfactory = Number(categorical.values[colIdx].values[i]);
                                } else if (col.roles['Good']) {
                                    good = Number(categorical.values[colIdx].values[i]);
                                }
                            }
                            colIdx++;
                        }



                        var bulletItem = new ReportItem();
                        var valueItem = new ReportItem();
                        bulletDetail = new Array;
                        valueDetail = new Array;

                        var id = "temp";
                        //host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId()
                        /*
                        var id = dataView.categorical.categories[0].identity
                            ? SelectionId.createWithId(dataView.categorical.categories[0].identity[i])
                            : SelectionId.createNull();
                        */

                        bulletItem.identity = id;

                        bulletItem.template = 'bullet';
                        bulletItem.title = categories[0].values[i].toString();
                        bulletItem.value = value;
                        bulletItem.target = targetValue;
                        bulletItem.maximum = (maximum == 0) ? max * 1.1 : maximum;
                        bulletItem.satisfactory = (satisfactory == 0) ? max * .60 : satisfactory;
                        bulletItem.good = (good == 0) ? max * .85 : good;
                        bulletDetail.push(bulletItem);

                        valueItem.template = 'value'
                        valueItem.value = value;
                        valueItem.title = categories[0].values[i].toString();
                        valueDetail.push(valueItem);

                        item[1] = bulletDetail;
                        item[2] = valueDetail;
                        viewModel.allSeries.push({ value: item })
                    }

                }
            }
        }


        return viewModel;
    }

    function defaultSettings(): VisualSettings {
        return {
            thresholds: {
                targetValue: 0,
                satisfactoryPercent: 50,
                goodPercent: 100,
                maximumPercent: 200,
            }
        };
    }


    export class Visual implements IVisual {
        private hostContainer: JQuery;
        private clearCatcher: d3.Selection<HTMLElement>;
        private scoreCardBody: d3.Selection<HTMLElement>;
        private scrollContainer: d3.Selection<HTMLElement>;
        private table: d3.Selection<HTMLElement>;
        private tHead: d3.Selection<HTMLElement>;
        private tBody: d3.Selection<HTMLElement>;
        private chart: Bullet;
        private static ScrollBarSize = 13;
        private viewport: IViewport;
        private element: d3.Selection<HTMLElement>;

        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private model: VisualViewModel;
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.element = d3.select(options.element);
        }

        public update(options: VisualUpdateOptions) {

            var dataViews = options.dataViews;
            if (!dataViews) return;

            let margin = { top: 0, left: 0, bottom: 0, right: 0 };
            let padding = { top: 0, left: 5, bottom: 0, right: 5 };

            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            this.element.selectAll('div, svg').remove();

            let container = this.element
                .append('table')
                .classed('c1-powerbi-table', true)
                .style({
                    'width': containerSize.width + 'px',
                    'height': containerSize.height + 'px',
                    'margin-top': margin.top + 'px',
                    'margin-left': margin.left + 'px'
                });
            container.style('background-color', '#C0C0C0');


            //this.hostContainer = options.element.style({ 'overflow-x', 'hidden'});

            this.tHead = container.append('thead').append('tr');
            this.tBody = container.append('tbody');
            //this.updateContainerViewports(options.viewport);

            var viewModel = visualTransform( options, this.host);
            this.model = viewModel;
    

            var allSeries = viewModel.allSeries.map(d => d.value.map(d => d));
            var headers = viewModel.headers.map(d => d.value);
             
            this.ClearViewport();

            var thSelection = this.tHead.selectAll('th').data(headers);
            var th = thSelection
                .enter().append('th');
            thSelection.text(d => d);


            var trSelectionData = this.tBody.selectAll("tr").data(allSeries);
            var trData = trSelectionData.enter().append("tr").on('click', function (d) {
                d3.selectAll("tr").style('background-color', '');
                //alert(d[1][0].identity);
                selectionManager.select(d[1][0].identity).then(ids => {
                    if (ids.length > 0) {
                        d3.select(this).style('background-color', 'LightSteelBlue');
                    } else {
                        d3.select(this).style('background-color', '');
                    }
                });

                (d3.event as Event).stopPropagation();

            });

            var selectionManager = this.selectionManager;

            this.chart = new Bullet();

            trData.selectAll("td")
                .data(d => d)
                .enter().append("td")
                .call(this.chart.init)
            trSelectionData.exit().remove();


        }

        private ClearViewport() {
            this.tBody.selectAll("transform").remove();
            this.tBody.selectAll("tr").remove();
            this.tBody.selectAll("td").remove();
            this.tBody.selectAll("text").remove();
            this.tBody.selectAll("rect").remove();
            this.tBody.selectAll('axis').remove();
            this.tBody.selectAll('path').remove();
            this.tBody.selectAll('line').remove();
            this.tBody.selectAll('tick').remove();
            this.tBody.selectAll('g').remove();
        }

        private isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        private format(d: number) {
            var prefix = d3.formatPrefix(d);
            return d3.round(prefix.scale(d), 2) + ' ' + prefix.symbol
        }

        private updateContainerViewports(viewport: IViewport) {
            var width = viewport.width;
            var height = viewport.height;

            this.tHead.classed('dynamic', width > 400);
            this.tBody.classed('dynamic', width > 400);

            this.hostContainer.css({
                'height': height,
                'width': width
            });
            this.table.attr('width', width);
        }





        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         * Below is a code snippet for a case where you want to expose a single property called "lineColor" from the object called "settings"
         * This object and property should be first defined in the capabilities.json file in the objects section.
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {

            var objectName = options.objectName;
            var objectEnumeration: VisualObjectInstance[] = [];

            switch (options.objectName) {
                case 'thresholds':
                    var thresholds: VisualObjectInstance = {
                        objectName: 'thresholds',
                        displayName: 'Thresholds',
                        selector: null,
                        properties: {
                            targetValue: this.model.tableChartScorecardSettings.thresholds.targetValue,
                            satisfactoryPercent: this.model.tableChartScorecardSettings.thresholds.satisfactoryPercent,
                            goodPercent: this.model.tableChartScorecardSettings.thresholds.goodPercent,
                            maximumPercent: this.model.tableChartScorecardSettings.thresholds.maximumPercent,
                        }
                    };
                    objectEnumeration.push(thresholds);
                    break;
            }

            return objectEnumeration;

        }
    }

    class BulletFunctions {


        public format(d: number) {
            if (d > 1) {
                var prefix = d3.formatPrefix(d);
                return d3.round(prefix.scale(d), 2) + ' ' + prefix.symbol
            }
            else {
                return d3.format(",%")(d);
            }
        }


        public bulletTranslate(x) {
            return function (d) {
                return "translate(" + x(d) + ",0)";
            };
        }

        public bulletWidth(x: Function) {
            var x0 = x(0);
            return function (d) {
                // return Math.abs(x(d));
                return Math.abs(x(d) - x0);
            };
        }
    }

    class ReportItem {
        identity: any;
        satisfactory: number;
        value: number;
        maximum: number;
        good: number;
        target: number;
        title: string;
        template: string
    }
    class Bullet {

        // For each small multiple…
        public init(g: d3.Selection<SVGElement>) {
            g.each(function (d, i) {

                var orientVal = "left"; // TODO top & bottom
                var reverseVal = false;
                var durationVal = 0;
                var widthVal = 200;
                var heightVal = 30;
                var tickFormatVal = null;
                var bulletFunctions = new BulletFunctions();


                // Default Label Report Item
                if (typeof (this.__data__[0].template) == 'undefined') {
                    g = d3.select(this);
                    g.append("div")
                        .text(this.__data__)
                    return;
                }

                var rangez = new Array;

                rangez.push(this.__data__[0].maximum);
                rangez.push(this.__data__[0].good);
                rangez.push(this.__data__[0].satisfactory);

                var measurez = new Array;;
                measurez.push(this.__data__[0].value);

                var markerz = new Array;
                markerz.push(this.__data__[0].target);

                // Value Report Item Template
                if (this.__data__[0].template == 'value') {
                    g = d3.select(this);
                    g.append("div")
                        .text(bulletFunctions.format(this.__data__[0].value))
                    return;
                }

                // Else Bullet Chart Template
                var margin = { top: 0, right: 5, bottom: 0, left: 10 },
                    width = 220 - margin.left - margin.right,
                    height = 50 - margin.top - margin.bottom;

                g = d3.select(this);

                var g = g.append("svg")
                    .attr("class", "bullet")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                // Compute the new x-scale.
                var x1 = d3.scale.linear()
                    .domain([0, Math.max(rangez[0], markerz[0], measurez[0])])
                    .range(reverseVal ? [this.widthVal, 0] : [0, widthVal]);

                // Retrieve the old x-scale, if this is an update.
                var x0 = this.__chart__ ||
                    d3.scale.linear()
                        .domain([0, Infinity])
                        .range(x1.range());

                // Stash the new scale.
                this.__chart__ = x1;

                // Derive width-scales from the x-scales.

                var w0 = bulletFunctions.bulletWidth(x0);
                var w1 = bulletFunctions.bulletWidth(x1);

                // Update the range rects.
                var range = g.selectAll("rect.range")
                    .data(rangez);

                range.enter()
                    .append("rect")
                    .attr("class", function (d, i) { return "range s" + i; })
                    .attr("width", w0)
                    .attr("height", heightVal)
                    .attr("x", reverseVal ? x0 : 0)
                    .transition()
                    .duration(durationVal)
                    .attr("width", w1)
                    .attr("x", reverseVal ? x1 : 0);

                range.transition()
                    .duration(durationVal)
                    .attr("x", reverseVal ? x1 : 0)
                    .attr("width", w1)
                    .attr("height", heightVal);


                // Update the measure rects.
                var measure = g.selectAll("rect.measure")
                    .data(measurez);

                measure.enter()
                    .append("rect")
                    .attr("class", function (d, i) { return "measure s" + i; })
                    .attr("width", w0)
                    .attr("height", heightVal / 3)
                    .attr("x", reverseVal ? x0 : 0)
                    .attr("y", heightVal / 3)
                    .transition()
                    .duration(durationVal)
                    .attr("width", w1)
                    .attr("x", reverseVal ? x1 : 0);

                measure.transition()
                    .duration(durationVal)
                    .attr("width", w1)
                    .attr("height", heightVal / 3)
                    .attr("x", reverseVal ? x1 : 0)
                    .attr("y", heightVal / 3);

                // Update the marker lines.
                var marker = g.selectAll("line.marker")
                    .data(markerz);


                marker.enter()
                    .append("line")
                    .attr("class", "marker")
                    .attr("x1", x0)
                    .attr("x2", x0)
                    .attr("y1", heightVal / 6)
                    .attr("y2", heightVal * 5 / 6)
                    .transition()
                    .duration(durationVal)
                    .attr("x1", x1)
                    .attr("x2", x1);

                marker.transition()
                    .duration(durationVal)
                    .attr("x1", x1)
                    .attr("x2", x1)
                    .attr("y1", heightVal / 6)
                    .attr("y2", heightVal * 5 / 6);

                // Compute the tick format.
                //var format = tickFormatVal || x1.tickFormat(8);

                var format = function (d: number) {
                    var prefix = d3.formatPrefix(d);
                    return d3.round(prefix.scale(d), 2) + '' + prefix.symbol
                }

                // Update the tick groups.
                var tick = g.selectAll("g.tick")
                    .data(x1.ticks(8),
                    function (d) {
                        return this.textContent || bulletFunctions.format(d);
                    });

                // Initialize the ticks with the old scale, x0.
                var tickEnter = tick.enter()
                    .append("g")
                    .attr("class", "tick")
                    .attr("transform", bulletFunctions.bulletTranslate(x0))
                    .style("opacity", 1e-6);

                tickEnter.append("line")
                    .attr("y1", heightVal)
                    .attr("y2", heightVal * 7 / 6);

                tickEnter.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1em")
                    .attr("y", heightVal * 7 / 6)
                    .text(bulletFunctions.format);

                // Transition the entering ticks to the new scale, x1.
                tickEnter.transition()
                    .duration(durationVal)
                    .attr("transform", bulletFunctions.bulletTranslate(x1))
                    .style("opacity", 1);

                // Transition the updating ticks to the new scale, x1.
                var tickUpdate = tick.transition()
                    .duration(durationVal)
                    .attr("transform", bulletFunctions.bulletTranslate(x1))
                    .style("opacity", 1);

                tickUpdate.select("line")
                    .attr("y1", heightVal)
                    .attr("y2", heightVal * 7 / 6);

                tickUpdate.select("text")
                    .attr("y", heightVal * 7 / 6);

                // Transition the exiting ticks to the new scale, x1.
                tick.exit()
                    .transition()
                    .duration(durationVal)
                    .attr("transform", bulletFunctions.bulletTranslate(x1))
                    .style("opacity", 1e-6)
                    .remove();

            });
            d3.timer.flush();
        }

        // left, right, top, bottom
        public orient = function (x) {
            if (!arguments.length) return this.orientVal;
            this.orientVal = x;
            this.reverseVal = this.orientVal == "right" || this.orientVal == "bottom";
            return this.orientVal;
        }

    }

}