module powerbi.extensibility.visual.ddlSlicerB1ABBB3E9A034BDDBD69B9CBD0005CA0  {
    export class Visual implements IVisual {
        private element: HTMLElement;
        private selectionManager: ISelectionManager;
        private selectionIds: any = {};
        private host: IVisualHost;
        private isEventUpdate: boolean = false;

        constructor(options: VisualConstructorOptions) {
            this.element = options.element;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
        }

        public update(options: VisualUpdateOptions) {
            if (options.type & VisualUpdateType.Data && !this.isEventUpdate) {
                this.init(options);
            }
        }

        public init(options: VisualUpdateOptions) {

            // Return if we don't have a category
            if (!options ||
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.dataViews[0].categorical ||
                !options.dataViews[0].categorical.categories ||
                !options.dataViews[0].categorical.categories[0]) {
                return;
            }

            // remove any children from previous renders
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }

            // clear out any previous selection ids
            this.selectionIds = {};

            // get the category data.
            let category = options.dataViews[0].categorical.categories[0];
            let values = category.values;

            //Create and append select list
            let ddl = document.createElement("select");
            ddl.className = 'form-control';

            ddl.onchange = function (ev) {
                    this.isEventUpdate = true; // This is checked in the update method. If true it won't re-render, this prevents and infinite loop
                    this.selectionManager.clear(); // Clean up previous filter before applying another one.
                    debugger;
                    // Find the selectionId and select it
                    this.selectionManager.select(this.selectionIds[ev.target.value]).then((ids: ISelectionId[]) => {
                        ids.forEach(function (id) {
                            console.log(id);
                        });
                    });

                    // This call applys the previously selected selectionId
                    this.selectionManager.applySelectionFilter();
                }.bind(this);
         

            // build selection ids to be used by filtering capabilities later
            values.forEach((item: number, index: number) => {

                // create an in-memory version of the selection id so it can be used in onclick event.
                this.selectionIds[item] = this.host.createSelectionIdBuilder()
                    .withCategory(category, index)
                    .createSelectionId();

                //debugger;
                let value = item.toString();
                let option = document.createElement("option");
                option.value = value;
                option.text = value;
  
                ddl.appendChild(option);

                
            })

            this.element.appendChild(ddl);

          
        }
    }
}
