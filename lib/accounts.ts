export const ACCOUNTS = {
  BCF: {
    apiKey: process.env.GHL_API_KEY_BCF!,
    locationId: process.env.GHL_LOCATION_ID_BCF!,
    pipelines: {
      LEAD: process.env.LEAD_PIPELINE_ID_BCF!,
      SALES: process.env.SALES_PIPELINE_ID_BCF!,
    },
  },

  BGR: {
    apiKey: process.env.GHL_API_KEY_BGR!,
    locationId: process.env.GHL_LOCATION_ID_BGR!,
    pipelines: {
      LEAD: process.env.LEAD_PIPELINE_ID_BGR!,
      SALES: process.env.SALES_PIPELINE_ID_BGR!,
    },
  },
} as const;

export type AccountType = keyof typeof ACCOUNTS;