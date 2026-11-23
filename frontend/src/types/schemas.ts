import { z } from 'zod';

export const AgentSignalSchema = z.object({
  type: z.string(),
  timestamp: z.number().optional(),
  data: z.any().optional(),
});

export const PositionUpdateSchema = z.object({
  symbol: z.string(),
  margin_ratio: z.number(),
  leverage: z.number(),
});

export const RiskVerdictSchema = z.object({
  status: z.string(),
  reason: z.string().optional(),
});
