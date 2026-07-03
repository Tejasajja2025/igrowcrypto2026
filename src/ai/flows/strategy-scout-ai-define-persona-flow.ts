'use server';
/**
 * @fileOverview This file defines a Genkit flow for the Strategy Scout AI.
 * It helps users define their trading persona and suggests personalized portfolio allocations
 * based on their preferences and market sentiment.
 *
 * - defineTradingPersona - A function that handles the trading persona definition and allocation suggestion process.
 * - StrategyScoutAIDefinePersonaInput - The input type for the defineTradingPersona function.
 * - StrategyScoutAIDefinePersonaOutput - The return type for the defineTradingPersona function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema Definition
const StrategyScoutAIDefinePersonaInputSchema = z.object({
  investmentGoals: z.string().describe('The user\'s primary investment goals (e.g., long-term growth, short-term gains, income generation).'),
  riskTolerance: z.string().describe('The user\'s risk tolerance (e.g., high, medium, low, conservative, aggressive).'),
  preferredAssets: z.string().describe('The user\'s preferred types of assets (e.g., crypto (Bitcoin, Ethereum), forex (USD/EUR, GBP/JPY), a mix).'),
  investmentHorizon: z.string().describe('The user\'s investment time horizon (e.g., less than 1 year, 1-3 years, 3-5 years, 5+ years).'),
  marketSentiment: z.string().describe('A summary of current market sentiment (e.g., "bullish", "bearish", "volatile", "mixed").')
});
export type StrategyScoutAIDefinePersonaInput = z.infer<typeof StrategyScoutAIDefinePersonaInputSchema>;

// Output Schema Definition
const StrategyScoutAIDefinePersonaOutputSchema = z.object({
  personaDescription: z.string().describe('A detailed description of the user\'s trading persona, summarizing their goals, risk tolerance, and approach.'),
  portfolioAllocation: z.array(z.object({
    assetClass: z.string().describe('The class of asset for allocation (e.g., Bitcoin, Ethereum, Major Forex Pairs, Altcoins, Stablecoins, Blue-Chip Stocks, etc.).'),
    percentage: z.number().min(0).max(100).describe('The percentage of the portfolio to allocate to this asset class (0-100).'),
    rationale: z.string().describe('The reason for allocating this percentage to this asset class, considering market sentiment and user persona.')
  })).describe('A suggested portfolio allocation, detailing asset classes, their percentages, and rationale.')
}).describe('The output of the Strategy Scout AI, including a trading persona description and a portfolio allocation suggestion.');
export type StrategyScoutAIDefinePersonaOutput = z.infer<typeof StrategyScoutAIDefinePersonaOutputSchema>;

// Exported wrapper function
export async function defineTradingPersona(input: StrategyScoutAIDefinePersonaInput): Promise<StrategyScoutAIDefinePersonaOutput> {
  return strategyScoutAIDefinePersonaFlow(input);
}

// Prompt Definition
const strategyScoutAIDefinePersonaPrompt = ai.definePrompt({
  name: 'strategyScoutAIDefinePersonaPrompt',
  input: { schema: StrategyScoutAIDefinePersonaInputSchema },
  output: { schema: StrategyScoutAIDefinePersonaOutputSchema },
  prompt: `You are an expert financial advisor specializing in cryptocurrency and forex markets. Your task is to analyze a user's investment preferences and current market sentiment to define a unique trading persona for them and suggest a personalized portfolio allocation.\n\nBased on the following user preferences and market sentiment:\n\nUser Investment Goals: {{{investmentGoals}}}\nUser Risk Tolerance: {{{riskTolerance}}}\nUser Preferred Assets: {{{preferredAssets}}}\nUser Investment Horizon: {{{investmentHorizon}}}\nCurrent Market Sentiment: {{{marketSentiment}}}\n\nFirst, define the user's trading persona. This should be a concise yet comprehensive description of who they are as an investor, reflecting their goals, risk appetite, preferred assets, and time horizon.\n\nSecond, based on this persona and the current market sentiment, suggest a portfolio allocation across different asset classes. Provide a clear percentage for each asset class and a brief rationale for why that allocation is suitable for the defined persona given the market conditions. Ensure the percentages sum up to 100. Focus primarily on crypto and forex assets, but you can include other relevant classes if appropriate for a well-diversified portfolio.\n\nExample Asset Classes: Bitcoin, Ethereum, Altcoins, Stablecoins, Major Forex Pairs (e.g., USD/EUR), Minor Forex Pairs, Commodities (e.g., Gold), Traditional Stocks. Prioritize crypto and forex as requested by the user.`
});

// Genkit Flow Definition
const strategyScoutAIDefinePersonaFlow = ai.defineFlow(
  {
    name: 'strategyScoutAIDefinePersonaFlow',
    inputSchema: StrategyScoutAIDefinePersonaInputSchema,
    outputSchema: StrategyScoutAIDefinePersonaOutputSchema
  },
  async (input) => {
    const { output } = await strategyScoutAIDefinePersonaPrompt(input);
    if (!output) {
      throw new Error('Failed to generate persona and allocation.');
    }
    return output;
  }
);
