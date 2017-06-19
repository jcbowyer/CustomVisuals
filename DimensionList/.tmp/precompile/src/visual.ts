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

module powerbi.extensibility.visual.dimensionListA06C58F3B8CD4CE3AF721D613A855B4B  {


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

            var categorical = dataView.categorical;
            if (categorical) {
                var categories = categorical.categories;
                if (categories && categories.length > 0) {
                    for (var h = 0; h < categories.length; h++) {
                        var categoryValsFlat = new Array();

                        for (var i = 0, catLength = categories[h].values.length; i < catLength; i++) {

                            //var identity = SelectionIdBuilder.builder().withCategory(dataView.categorical.categories[h], i).createSelectionId();
                            /*var selectionId = dataView.categorical.categories[h].identity
                                ? SelectionId.createWithId(dataView.categorical.categories[h].identity[i])
                                : SelectionId.createNull();
                            */
                            var selectionId = host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[h], i).createSelectionId()
                            
                            var identity = dataView.categorical.categories[h].identity[i];

                            var path;
                            var parentPath = "";
                            var level = 1;


                            // Set parent path
                            if (typeof (eval("dataView.categorical.categories[h].identity[i].expr.left")) != 'undefined') {
                                var x = dataView.categorical.categories[h].identity[i].expr;
                                while (typeof (eval("x.left")) != 'undefined') {
                                    if (typeof (eval("x.left.ref")) == 'undefined') {
                                        parentPath += ":" + eval("x.right.left.ref") + '|' + eval("x.right.right.valueEncoded");
                                    }
                                    else {
                                        parentPath += ":" + eval("x.left.ref") + '|' + eval("x.right.valueEncoded");
                                    }
                                    level++;
                                    x = eval("x.left");

                                }
                            }

                            // Set path
                            if (typeof (eval("dataView.categorical.categories[h].identity[i].expr.right.left")) != 'undefined') {
                                path = parentPath + '>' + eval("dataView.categorical.categories[h].identity[i].expr.right.left.ref") + '|' + eval("dataView.categorical.categories[h].identity[i].expr.right.right.valueEncoded");
                            }
                            else {
                                path = parentPath;
                            }

                            categoryValsFlat.push({
                                value: categories[h].values[i],
                                identity: identity,
                                selectionId: selectionId,
                                key: selectionId.getKey(),
                                parentPath: parentPath,
                                path: path,
                                level: level
                            })
                        }


                        var dataSourceGroup = new kendo.data.HierarchicalDataSource({ data: categoryValsFlat });
                        dataSourceGroup.group({ field: "value" });

                        // Load child items
                        var topCategories = new Array;
                        for (i = 0; i < dataSourceGroup.view().length; i++) {
                            var categoryItems = new Array();
                            var categoryIdentities = new Array();
                            var categoryIdentitiesExpr = new Array();
                            for (var j = 0; j < dataSourceGroup.view()[i].items.length; j++) {
                                var d = dataSourceGroup.view()[i].items[j];
                                categoryItems.push({ id: j.toString(), categories: [], value: d.value, selectionId: d.selectionId, identity: d.identity, key: d.key, parentPath: d.parentPath, path: d.path, level: 2 });
                                categoryIdentities.push(d.identity);
                                categoryIdentitiesExpr.push(d.identity.expr);
                            }
                            var selectionIdExpr;

                            //var SQExpr = data.SQExprBuilder.or.apply(data, categoryIdentitiesExpr);
                            //var identityExpr = data.createDataViewScopeIdentity(SQExpr);
                            //var selectionIdExpr = SelectionId.createWithId(identityExpr);
                            //var selectionId = SelectionId.createWithIds.apply(SelectionId, categoryIdentities);

                            topCategories.push({ id: i.toString(), categories: categoryItems, value: dataSourceGroup.view()[i].value, selectionId: selectionIdExpr, identity: null, key: null, parentPath: null, path: null, level: 1 });
                        }

                        viewModel.categories.push({ id: h.toString(), categories: topCategories, value: categories[h].source.displayName, selectionId: null, identity: null, key: null, parentPath: null, path: null, level: 0 });
                    }
                }
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
        private multiSelects: any[];
        private isEventUpdate: boolean = false;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.model = { categories: [] };
            this.element = $(options.element);
            this.multiSelects = new Array();
        }

        private updateContainerViewports(viewport: IViewport) {
            var width = viewport.width;
            var height = viewport.height;

            this.element.attr('width', width);
        }

        public update(options: VisualUpdateOptions) {
            console.log('update' + this.isEventUpdate);
            if (this.isEventUpdate)
                return;


            let dataChanged = (options.type == VisualUpdateType.Data || options.type == VisualUpdateType.All || $('.chart').length == 0);
            if (dataChanged ) {
                this.model = visualTransform(options, this.host);
                $('div, svg', this.element).remove();
            }
            
            if (this.model.categories.length == 0) return;

            let host = this.host;
            let selectionManager = this.selectionManager;

            let margin = { top: 0, left: 0, bottom: 5, right: 0 };
            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            let $container, $multiSelect;

            if (dataChanged) {
                $container = $('<div id="myDiv" class="chart"></div>').appendTo(this.element);
                var dataSource = null;

                for (var i = 0; i < this.model.categories.length; i++) {
                    var multiSelect = <kendo.ui.MultiSelect>$("#myMultiSelect" + this.model.categories[i].id).data("kendoMultiSelect");
                    if (typeof (multiSelect) != 'undefined') {
                        multiSelect.destroy();
                    }
                }
            }
            {
                $container = $('.chart');
            }

            $container.css({
                'width': containerSize.width + 'px',
                'height': containerSize.height + 'px',
                'margin-top': margin.top + 'px',
                'margin-left': margin.left + 'px'
            });



            //$("#myDiv").html("<span id='myListView'></span>");

            for (var i = 0; i < this.model.categories.length; i++) {

                dataSource = new kendo.data.HierarchicalDataSource({
                    data: this.model.categories[i].categories,
                    schema: {
                        model: {
                            value: { type: "string" },
                            "path": { type: "string" },
                            "parentPath": { type: "string" },
                            "selector": { type: "string" },
                            children: "categories",
                            hasChildren: true
                        }
                    }
                });

                dataSource.read();
                //kendo.ui.progress($("#myDiv"), true);
                //dataSource.group({ field: "value" });
                var selected = "";
                var multiSelects;
                
                if (dataChanged) {
                    $("<div id='myMulitiSelectHeader'></div><div class='row'><label  for='myMultiSelect" + this.model.categories[i].id + "'>" + this.model.categories[i].value + ": </label><select data-placeholder='Select ...'  id='myMultiSelect" + this.model.categories[i].id + "'> </select></div>").appendTo($container);
                    multiSelects = this.multiSelects;
                    $multiSelect = $("#myMultiSelect" + this.model.categories[i].id).kendoMultiSelect(
                        {
                            dataTextField: "value",
                            dataValueField: "value",
                            dataSource: dataSource,
                            filter: "contains",
                            change: function (e) {
                                
                                kendo.ui.progress($("#myDiv"), true);
                                var mutltiSelected = this;
                                var selectionIds = new Array;
                                var selectionIdsSimple;

                                //var deferredClear = selectionManager.clear();
                                //$.when.apply(null, deferredClear);

                                var selected = "";
                                // for each multiSelect
                                for (var m = 0; m < multiSelects.length; m++) {
                                    var multiSelect = multiSelects[m];
                                    // for all rows in datasource
                                    for (var g = 0; g < multiSelect.dataSource.data().length; g++) {
                                        // For items in selected category                                                                        
                                        for (var h = 0; h < mutltiSelected.value().length; h++) {
                                            var item = multiSelect.dataSource.at(g);
                                            var firstentity = "";
                                            //$("#myListView").text (' of ' + this.dataSource.data().length);    

                                            if (item.value == mutltiSelected.value()[h]) {
                                                item.load();
                                                var s = '';
                                                for (var i = 0; i < item.children.data().length; i++) {
                                                    s = s + item.children.data()[i].path + "<br>";
                                                    if (selectionIds.indexOf(item.children.data()[i].selectionId) == -1) {                                                 
                                                        selectionIds.push(item.children.data()[i].selectionId);
                                                    }
                                                }
                                                selectionIdsSimple = selectionIds[0];
                                                //selectionIdsSimple = item.selectionId;
                                                $("#myListView").text();
                                            }
                                        }
                                    }
                                }


                                // $("#myListView").text(JSON.stringify(selectionIdsSimple) + "------------------------------------" + JSON.stringify(selectionIds));
                                //$("#myMulitiSelectHeader").text(JSON.stringify(selectionIds);
                     
                                if (typeof (selectionIdsSimple) != 'undefined') {
                                    //debugger;
                                    console.log('set update to true; items select');
                                    this.isEventUpdate = true;
                                    selectionManager.clear(); 
                                    selectionManager.select(selectionIdsSimple, true);
                                    selectionManager.applySelectionFilter();
                                }
                                else
                                {
                                    console.log('no items selected');
                                }

                                //var selectionDeffered = selectionIds.map(function (id) { return selectionManager.select(id, true); });
                                //$.when.apply(null, selectionDeffered);
                                kendo.ui.progress($("#myDiv"), false);
                            },
                            open: function (e) {
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
                                    'font': 'normal normal normal normal 14px / 25.2px Arial, Helvetica, sans-serif',
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
                                    $(this).css('background', 'transparent');
                                    $('li.k-item.k-state-selected').css({
                                        'background': 'rgb(66, 139, 202)',
                                        'color': 'rgb(255, 255, 255)',
                                    });
                                });
                            }
                        }
                    ).data("kendoMultiSelect");

                }
                {

                }

                /*
                var multiSelect = $("#myMultiSelect" + viewModel.categories[i].id).kendoMultiSelect({
                    dataTextField: "value",
                    dataValueField: "value",
                    dataSource: dataSource,
                    filter: "contains",
      
                    change: function (e) {

                        kendo.ui.progress($("#myDiv"), true);

                        var mutltiSelected = this;
                        var selectionIds = new Array;
                        var selectionIdsSimple;

                        var deferredClear = selectionManager.clear();
                        $.when.apply(null, deferredClear);

                        var selected = "";
                        // for each multiSelect
                        for (var m = 0; m < multiSelects.length; m++) {
                            var multiSelect = multiSelects[m];
                            // for all rows in datasource
                            for (var g = 0; g < multiSelect.dataSource.data().length; g++) {
                                // For items in selected category                                                                        
                                for (var h = 0; h < mutltiSelected.value().length; h++) {
                                    var item = multiSelect.dataSource.at(g);
                                    var firstentity = "";
                                    //$("#myListView").text (' of ' + this.dataSource.data().length);    

                                    if (item.value == mutltiSelected.value()[h]) {

                                        item.load();

                                        var s = '';
                                        for (var i = 0; i < item.children.data().length; i++) {
                                            s = s + item.children.data()[i].path + "<br>";
                                            if (selectionIds.indexOf(item.children.data()[i].selectionId) == -1) {
                                                selectionIds.push(item.children.data()[i].selectionId);
                                            }
                                        }

                                        selectionIdsSimple = item.selectionId;
                                        $("#myListView").text();
                                    }
                                }
                            }
                        }

                        // $("#myListView").text(JSON.stringify(selectionIdsSimple) + "------------------------------------" + JSON.stringify(selectionIds));
                        //$("#myMulitiSelectHeader").text(JSON.stringify(selectionIds);
                        if (typeof (selectionIdsSimple) != 'undefined')
                            var selectionDeffered = selectionManager.select(selectionIdsSimple, true);

                        //var selectionDeffered = selectionIds.map(function (id) { return selectionManager.select(id, true); });
                        //$.when.apply(null, selectionDeffered);
                        kendo.ui.progress($("#myDiv"), false);

                    }
                }).data("kendoMultiSelect");
                */

                this.multiSelects.push($multiSelect);
                multiSelects = this.multiSelects;

                //  $("#myListView").text (JSON.stringify(viewModel));
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