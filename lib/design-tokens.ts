export const DESIGN_TOKENS = {
  spacing: {
    cardPadding: "p-4 sm:p-5",
    sectionMargin: "mb-6",
    gridGap: "gap-3 sm:gap-4",
    pageContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8",
  },

  typography: {
    pageTitle: "text-2xl font-bold text-gray-900",
    pageSubtitle: "text-sm text-gray-600 mt-1",
    metricLabel: "text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide",
    metricValue: "text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900",
    metricChange: "text-xs text-green-600 mt-2 font-medium",
    tableHeader: "text-xs font-semibold text-gray-600 uppercase tracking-wide",
    tableCell: "text-sm text-gray-700",
  },

  colors: {
    primary: "#00a63e",
    metric: {
      green: "bg-green-50 border-green-200",
      blue: "bg-blue-50 border-blue-200",
      purple: "bg-purple-50 border-purple-200",
      orange: "bg-orange-50 border-orange-200",
      gray: "bg-gray-50 border-gray-200",
    },
    icons: {
      green: "text-green-600",
      blue: "text-blue-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
      gray: "text-gray-600",
    },
  },

  effects: {
    cardBorder: "border border-gray-200 rounded-lg",
    cardShadow: "shadow-sm hover:shadow-md transition-all",
    tableBorder: "border border-gray-200 rounded-lg overflow-hidden shadow-sm",
  },
} as const;
