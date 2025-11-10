// Chart templates for consistent visualizations
// Apply brand colors and responsive sizing automatically

interface ChartMetadata {
  xField?: string;
  yField?: string;
  sortBy?: string;
  xType?: "quantitative" | "nominal" | "ordinal" | "temporal";
  yType?: "quantitative" | "nominal" | "ordinal" | "temporal";
  colorField?: string;
  valueField?: string; // For pie charts
  xTitle?: string;
  yTitle?: string;
  suggestedHeight?: number;
}

// Shared brand config
const BRAND_CONFIG = {
  range: {
    category: ["#9ECCDB", "#0498C8", "#007DA6", "#025C7A", "#023D52"],
    ordinal: ["#9ECCDB", "#0498C8", "#007DA6", "#025C7A", "#023D52"],
    ramp: ["#9ECCDB", "#025875"],
    heatmap: ["#9ECCDB", "#C8F0FF", "#8AD9F8", "#4EC3F0", "#1BA8DD", "#0084B0", "#00516E"]
  },
  bar: { color: "#00A9E0" },
  line: { color: "#00A9E0" },
  area: { color: "#00A9E0" },
  point: { filled: true, color: "#00A9E0" },
  axis: {
    labelFontSize: 12,
    titleFontSize: 13,
    labelColor: "#132933",
    titleColor: "#212121"
  },
  view: { stroke: "transparent" },
  legend: {
    labelFontSize: 14,
    titleFontSize: 16,
    titleColor: "#000000",
    labelColor: "#132933"
  }
};

// Calculate dynamic height based on data length
function calculateHeight(dataLength: number, baseHeight: number = 200): number {
  return Math.max(baseHeight, 28 * Math.max(1, dataLength) + 40);
}

// Generate bar chart spec
export function generateBarChart(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  metadata: ChartMetadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const {
    xField = "count",
    yField = "category",
    sortBy = "-x",
    xType = "quantitative",
    yType = "nominal",
    colorField,
    xTitle = "Tickets cerrados",
    yTitle = "Categoría"
  } = metadata;

  const dynamicHeight = calculateHeight(data.length);
  
  // Dynamic width: base on data length, max 800px, min 400px
  const dynamicWidth = Math.min(800, Math.max(400, 50 + data.length * 8));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const encoding: any = {
    x: {
      field: xField,
      type: xType,
      axis: { title: xTitle, format: "d" },
      scale: { nice: true }
    },
    y: {
      field: yField,
      type: yType,
      sort: sortBy,
      axis: { title: yTitle, labelLimit: 300 }
    },
    // Add tooltip with all relevant fields
    tooltip: [
      { field: yField, type: yType === "nominal" ? "nominal" : yType === "ordinal" ? "ordinal" : "quantitative", title: yTitle },
      { field: xField, type: xType, format: "d", title: xTitle }
    ]
  };

  // Add color encoding if colorField is specified
  if (colorField) {
    encoding.color = {
      field: colorField,
      type: "nominal",
      legend: null
    };
  } else {
    encoding.color = {
      field: yField,
      type: "nominal",
      legend: null
    };
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    mark: { type: "bar" },
    width: dynamicWidth,
    height: dynamicHeight,
    encoding,
    config: BRAND_CONFIG
  };
}

// Generate line chart spec
export function generateLineChart(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  metadata: ChartMetadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const {
    xField = "date",
    yField = "count",
    xType = "ordinal",
    yType = "quantitative",
    xTitle = "Fecha",
    yTitle = "Tickets cerrados"
  } = metadata;

  // Dynamic width based on data points to prevent label overlap
  // For dates, each point needs ~60px, max 900px
  const dynamicWidth = Math.min(900, Math.max(400, 30 + data.length * 60));

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    mark: { type: "line", point: true },
    width: dynamicWidth,
    height: 300,
    encoding: {
      x: {
        field: xField,
        type: xType,
        sort: null,
        axis: {
          title: xTitle,
          labelAngle: -45,
          labelOverlap: false
        }
      },
      y: {
        field: yField,
        type: yType,
        axis: { format: "d", title: yTitle },
        scale: { zero: true, nice: true }
      },
      // Add tooltip
      tooltip: [
        { field: xField, type: xType, title: xTitle },
        { field: yField, type: yType, format: "d", title: yTitle }
      ]
    },
    config: BRAND_CONFIG
  };
}

// Generate pie chart spec
export function generatePieChart(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  metadata: ChartMetadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const {
    yField = "source",
    valueField = "count",
    yTitle = "Canal"
  } = metadata;

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    encoding: {
      theta: {
        field: valueField,
        type: "quantitative",
        stack: true
      },
      color: {
        field: yField,
        type: "nominal",
        legend: { 
          title: yTitle,
          labelFontSize: 14,
          titleFontSize: 16
        }
      },
      tooltip: [
        { field: yField, type: "nominal", title: yTitle },
        { field: valueField, type: "quantitative", format: "d", title: "Tickets" },
        { field: "pct", type: "quantitative", format: ".1f", title: "Porcentaje", formatType: "number" }
      ]
    },
    layer: [
      {
        mark: { type: "arc", tooltip: true }
      },
    ],
    width: 250,
    height: 250,
    config: BRAND_CONFIG
  };
}

// Auto-generate spec based on chartType hint
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateChartSpec(payload: any):
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any | null {
  const { chartType, data, metadata = {} } = payload;

  if (!data || !Array.isArray(data)) {
    return null;
  }

  switch (chartType) {
    case "bar":
      return generateBarChart(data, metadata);
    case "line":
      return generateLineChart(data, metadata);
    case "pie":
      return generatePieChart(data, metadata);
    default:
      return null;
  }
}

