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


    interface VisualViewModel {
        id?: string;
        value?: string;
        identity?: any;
        selectionId?: any; //SelectionId
        key?: string;
        categories: VisualViewModel[];
        parentPath?: string;
        path?: string;
        level?: number;
        visualSettings?: VisualSettings;
    }

    interface VisualSettings {

    }


    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): VisualViewModel {

        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();

        let viewModel: VisualViewModel = {
            categories: []
        }

        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;

            if (objects) {
            }
        }

        let dataView = dataViews[0];
        {
            // clear out any previous selection ids
            var selectionIds = {};

            var categorical = dataView.categorical;
            if (categorical) {

                let category = categorical.categories[0];
                let values = category.values;
                var categoryValsFlat = new Array();
                /*
                for (var i = 0, catLength = values.length; i < catLength; i++) {
                    
                    // create an in-memory version of the selection id so it can be used in onclick event.
                    //this.host not working for some reason
                    var selectionId =  host.createSelectionIdBuilder().withCategory(category, i).createSelectionId();              
                    var value = values[i].toString();
                    categoryValsFlat.push({ value: value, selectionId: selectionId })
                   
                } */
                values.forEach((item: number, index: number) => {

                    // create an in-memory version of the selection id so it can be used in onclick event.
                    selectionIds[item] = host.createSelectionIdBuilder()
                        .withCategory(category, index)
                        .createSelectionId();
                    var value = item.toString();
                    categoryValsFlat.push({ value: value, selectionId: selectionIds[item] })

                })

                viewModel.categories.push({ id: '0', categories: categoryValsFlat });
                viewModel.selectionId = selectionIds;
            }
        }
        return viewModel;
    }

    function defaultSettings(): VisualSettings {
        return {

        };
    }

    export class Visual implements IVisual {
        private hostContainer: JQuery;
        private static ScrollBarSize = 13;
        private viewport: IViewport;
        private element: JQuery;

        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private model: VisualViewModel;
        private settings: VisualSettings;
        private comboBoxes: any[];
        private $container: JQuery;
        private $comboBox: any
        private selectionIds: any = {};
        private isEventUpdate: boolean = false;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.model = { categories: [] };
            this.element = $(options.element);
            this.comboBoxes = new Array();
        }

        private updateContainerViewports(viewport: IViewport) {
            var width = viewport.width;
            var height = viewport.height;
            this.element.attr('width', width);
        }

        public update(options: VisualUpdateOptions) {
            let host = this.host;
            let selectionManager = this.selectionManager;

            if (this.isEventUpdate)
                return;

            if (typeof (this.$comboBox) != 'undefined') {
                selectionManager.clear();
                selectionManager.select(this.$comboBox.selectionId);
                selectionManager.applySelectionFilter();
                return;
            }

            let dataChanged = (options.type == VisualUpdateType.Data || options.type == VisualUpdateType.All || $('.chart').length == 0);
            if (dataChanged) {
                this.model = visualTransform(options, this.host);
                this.selectionIds = this.model.selectionId;
                $('div, svg', this.element).remove();
            }

            if (this.model.categories.length == 0) return;

            let margin = { top: 0, left: 0, bottom: 5, right: 0 };
            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            if (dataChanged) {
                this.$container = $('<div id="myDiv" class="chart"></div>').appendTo(this.element);
                var dataSource = null;

                for (var i = 0; i < this.model.categories.length; i++) {
                    var comboBox = <kendo.ui.ComboBox>$("#mycomboBox" + this.model.categories[i].id).data("kendoComboBox");
                    if (typeof (comboBox) != 'undefined') {
                        comboBox.destroy();
                    }
                }
            }
            {
                this.$container = $('.chart');
            }

           

            this.$container.css({
                'width': containerSize.width + 'px',
                'height': containerSize.height + 'px',
                'margin-top': margin.top + 'px',
                'margin-left': margin.left + 'px'
            });

            for (var i = 0; i < this.model.categories.length; i++) {
                dataSource = new kendo.data.DataSource({
                    data: this.model.categories[i].categories,
                    schema: {
                        model: {
                            id: "value",
                            value: { type: "string" }
                        }
                    }
                });

                dataSource.read();
                var selected = "";
                var comboBoxes;

                if (dataChanged) {

                    // for all rows in datasource
                    for (var g = 0; g < dataSource.data().length; g++) {
                        // For items in selected category       
                        var item = dataSource.at(g);
                        $("<option value='" + item.value + "'>" + item.value + "</option>").appendTo($('#ddlSlicer'));

                    }

                    let selectionIds = this.selectionIds;

                   
                    /////////////////
                    // combo
                    /////////////////
                    $("<div id='myMulitiSelectHeader'></div><div class='row'><select data-placeholder='Select ...'  id='mycomboBox" + this.model.categories[i].id + "'> </select></div>").appendTo(this.$container);
                    comboBoxes = this.comboBoxes;
                    this.$comboBox = $("#mycomboBox" + this.model.categories[i].id).kendoComboBox(
                        {
                            dataTextField: "value",
                            dataValueField: "value",
                            dataSource: dataSource,
                            autoBind: false,
                            filter: "contains",
                            //template: '<span  class="li.k-item" onmouseover="this.parentElement.style.background=&quot;rgb(235, 235, 235)&quot;"  onmouseout="this.parentElement.style.background=&quot;white&quot;" style="font-size:14px;min-height:25.2px">#:value#</span>',
                            dataBound: function () {

                                if (typeof (this.selectionId) == 'undefined') {
                                    this.select(0);
                                    var item = this.dataSource.view[0];
                                    this.selectionId = selectionIds[item.value];

                                    this.trigger("cascade");
                                }
                            },
                            cascade: function (e) {

                                kendo.ui.progress($("#myDiv"), true);
                                // for all rows in datasource
                                for (var g = 0; g < this.dataSource.data().length; g++) {
                                    // For items in selected category       
                                    var item = this.dataSource.at(g);
                                    if (item.value == this.value()) {
                                        this.selectionId = selectionIds[item.value];
                                        //localStorage.setItem("selectionId", JSON.stringify(this.selectionId));
                                        //sessionStorage.setItem("selectionId", JSON.stringify(this.selectionId));
                                        //setCookie("selectionId", kendo.stringify(this.selectionId), 1);
                                    }
                                }


                                if (typeof (this.selectionId) != 'undefined') {
                                    console.log('set update to true; items select');
                                    selectionManager.clear();

                                    selectionManager.select(this.selectionId).then((ids: ISelectionId[]) => {
                                        ids.forEach(function (id) {
                                            console.log(id);
                                        });

                                        // This call applys the previously selected selectionId
                                        selectionManager.applySelectionFilter();
                                    });
                                }
                                else {
                                    console.log('no items selected');
                                }

                                kendo.ui.progress($("#myDiv"), false);
                            },
                           
                            change: function (e) {
                                formatList();
                            },
                            filtering: function (e) {
                                formatList();
                            },
                            open: function (e) {
                                formatList();
                            }
                        }
                    ).data("kendoComboBox");

                }
                this.$comboBox.dataSource.read();
                this.comboBoxes.push(this.$comboBox);
                comboBoxes = this.comboBoxes;

            }
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

            }

            return objectEnumeration;

        }
    }
}

function formatList()
{
    $('.k-list-scroller').css( {
        'overflow-y': 'scroll',
        'overflow-x': 'hidden',
        'height': '100px'
    })

    $('ul.k-list').css({
        'z-index': '99 !important',
        'color': 'rgb(51, 51, 51)',
        'text-decoration': 'none solid rgb(51, 51, 51)',
        'column-rule-color': 'rgb(51, 51, 51)',
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        'webkit-text-emphasis-color': 'rgb(51, 51, 51)',
        '-webkit-text-fill-color': 'rgb(51, 51, 51)',
        '-webkit-text-stroke-color': 'rgb(51, 51, 51)',
        'caret-color': 'rgb(51, 51, 51)',
        'border': '0px none rgb(51, 51, 51)',
        'font': 'normal normal normal normal 14px / normal Arial, Helvetica, sans-serif;',
        'list-style': 'none outside none',
        'margin': '0px',
        'outline': 'rgb(51, 51, 51) none 0px',
        'padding': '0px',
        '-webkit-border-after': '0px none rgb(51, 51, 51)',
        '-webkit-border-before': '0px none rgb(51, 51, 51)',
        '-webkit-border-end': '0px none rgb(51, 51, 51)',
        '-webkit-border-start': '0px none rgb(51, 51, 51)'
        
        
    });
    $('li.k-item').css({
        'background': 'rgb(255, 255, 255)',
        'color': 'rgb(51, 51, 51)',
        'cursor': 'default',
        'height': '25.1979px',
        'min-height': '25.2px',
        'text-decoration': 'none solid rgb(51, 51, 51)',
        'column-rule-color': 'rgb(51, 51, 51)',
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        '-webkit-text-emphasis-color': 'rgb(51, 51, 51)',
        '-webkit-text-fill-color': 'rgb(51, 51, 51)',
        'caret-color': 'rgb(51, 51, 51)',
        'border': '1px solid rgba(0, 0, 0, 0)',
        'font': 'normal normal normal normal 14px / normal Arial, Helvetica, sans-serif',
        'list-style': 'none outside none',
        'outline': 'rgb(51, 51, 51) none 0px',
        'padding': '0px 4px',
        '-webkit-border-after': '1px solid rgba(0, 0, 0, 0)',
        '-webkit-border-before': '1px solid rgba(0, 0, 0, 0)',
        '-webkit-border-end': '1px solid rgba(0, 0, 0, 0)',
        '-webkit-border-start': '1px solid rgba(0, 0, 0, 0)'
    });
    $('li.k-item.k-state-selected').css({
        'background': 'rgb(66, 139, 202)',
        'color': 'rgb(255, 255, 255)',
        'column-rule-color': 'rgb(255, 255, 255)',
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        '-webkit-text-emphasis-color': 'rgb(255, 255, 255)',
        '-webkit-text-fill-color': 'rgb(255, 255, 255)',
        '-webkit-text-stroke-color': 'rgb(255, 255, 255)'
    });

    $('li.k-item').mouseover(function () {
        if ($('li.k-item ul li:hover').length) {
            $('li.k-item ul li:hover').css('background', 'rgb(235, 235, 235)');
            $('li.k-item ul li:hover').css('color', 'rgb(51, 51, 51)');
        }
        else {
            $('li:hover').css('background', 'rgb(235, 235, 235)');
            $('li.k-item ul li:hover').css('color', 'rgb(51, 51, 51)');
            $('li.k-item.k-state-selected').css({
                'background': 'rgb(66, 139, 202)',
                'color': 'rgb(255, 255, 255)',
            });
        }
    });

    $('li.k-item').mouseout(function () {
        $(this).css('background', 'white');
        $('li.k-item.k-state-selected').css({
            'background': 'rgb(66, 139, 202)',
            'color': 'rgb(255, 255, 255)',
        });
    });
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

