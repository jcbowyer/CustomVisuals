import LegendModule = powerbi.extensibility.utils.chart.legend;
import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;

import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;
import InteractivityModule = powerbi.extensibility.utils.interactivity;
import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;

module powerbi.extensibility.visual {
    
    export interface VisualBehaviorOptions {
        selection: d3.Selection<SelectableDataPoint>;
        clearCatcher: d3.Selection<any>;
        hasHighlights: boolean;
    }

    export class VisualBehavior implements IInteractiveBehavior {
        private selection: d3.Selection<SelectableDataPoint>;
        private hasHighlights: boolean;

        public bindEvents(options: VisualBehaviorOptions, selectionHandler: ISelectionHandler): void {
            const clearCatcher: d3.Selection<any> = options.clearCatcher;

            this.selection = options.selection;
            this.hasHighlights = options.hasHighlights;

            this.selection.on("click", (dataPoint: SelectableDataPoint) => {
                const mouseEvent: MouseEvent = d3.event as MouseEvent;

                selectionHandler.handleSelection(dataPoint, mouseEvent.ctrlKey);
                mouseEvent.stopPropagation();
            });

            clearCatcher.on("click", () => {
                selectionHandler.handleClearSelection();
            });
        }

        public renderSelection(hasSelection: boolean): void {
            
            this.selection.style("opacity", (dataPoint: any) => {
                return getFillOpacity(
                    dataPoint.selected,
                    dataPoint.highlight,
                    !dataPoint.highlight && hasSelection,
                    !dataPoint.selected && this.hasHighlights);
            });
        }
    }

    export interface LegendCustomIcon {
        icon?: string;
        color?:string;
        identity?: any;
    }

    export function appendLegendMargins(legend: ILegend, margins) {

        if (legend) {
            let legendViewPort: IViewport = legend.getMargins();
            let legendOrientation = legend.getOrientation();

            if (legend.isVisible()) {
                if (legendOrientation == LegendPosition.Top || legendOrientation == LegendPosition.TopCenter) {
                    margins.top += legendViewPort.height;
                } else if (legendOrientation == LegendPosition.Left || legendOrientation == LegendPosition.LeftCenter) {
                    margins.left += legendViewPort.width;
                } else if (legendOrientation == LegendPosition.Right || legendOrientation == LegendPosition.RightCenter) {
                    margins.right += legendViewPort.width + 20;
                } else {
                    margins.bottom += legendViewPort.height;
                }
            }
        }

        return margins;
    }

    export function getFillOpacity(selected: boolean, highlight: boolean, hasSelection: boolean, hasPartialHighlights: boolean): number {

        if ((hasPartialHighlights && !highlight) || (hasSelection && !selected))
            return 0.3;

        return 1;
    }

    export function replaceLegendIconsWithCustom(itemsWithCustomIcons: LegendCustomIcon[]) {

        if (itemsWithCustomIcons.length > 0) {

            let group = d3.select('#legendGroup');
            group.selectAll('.legendItem').each(function (d, i) {
                let el = d3.select(this);
                let text = el.select('.legendText');
                for (let i = 0; i < itemsWithCustomIcons.length; i++) {

                    let item = itemsWithCustomIcons[i];
                    let changeIcon = (item.identity ? item.identity.equals(el.datum().identity) : false);

                    if (changeIcon) {
                        let icon = el.select('.legendIcon');
                        let x = parseInt(icon.attr('cx'));
                        let y = parseInt(icon.attr('cy'));
                        let r = parseInt(icon.attr('r'));
                        
                        if (item.icon == 'circle') {
                            icon.style('fill', item.color);

                        } else if (item.icon == 'line') {
                            icon.style('display', 'none');
                            el.selectAll('line').remove();
                            el
                                .append('line')
                                .attr('x1', x)
                                .attr('x2', x)
                                .attr('y1', y - r)
                                .attr('y2', y + r)
                                .style({
                                    'stroke': item.color,
                                    'stroke-width': r / 2,
                                });

                        } else if (item.icon == 'cross') {
                            icon.style('display', 'none');
                            el.selectAll('line').remove();
                            el
                                .append('line')
                                .attr('x1', x + r)
                                .attr('x2', x - r)
                                .attr('y1', y - r)
                                .attr('y2', y + r)
                                .style({
                                    'stroke': item.color,
                                    'stroke-width': r / 2
                                });
                            el
                                .append('line')
                                .attr('x1', x - r)
                                .attr('x2', x + r)
                                .attr('y1', y - r)
                                .attr('y2', y + r)
                                .style({
                                    'stroke': item.color,
                                    'stroke-width': r / 2
                                });

                        }
                        break;
                    }
                }
            });
        }
    
    }

    
}