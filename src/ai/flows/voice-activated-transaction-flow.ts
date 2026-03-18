
/**
 * @fileOverview AI-powered voice command processor stub for QTBM Wallet.
 * In a static export environment, server actions are not supported.
 */

import { z } from 'zod';

const VoiceActivatedTransactionInputSchema = z.object({
  commandText: z.string().describe('The transcribed voice command from the user.'),
});
export type VoiceActivatedTransactionInput = z.infer<typeof VoiceActivatedTransactionInputSchema>;

const VoiceActivatedTransactionOutputSchema = z.object({
  intent: z.enum(['sendMoney', 'deposit', 'servicePayment', 'goToPage', 'unknown']),
  entities: z.object({
    amount: z.number().optional(),
    currency: z.enum(['YER', 'USD', 'SAR']).optional(),
    recipientUid: z.string().optional(),
    page: z.enum(['home', 'services', 'history', 'settings']).optional(),
    serviceName: z.string().optional(),
  }).optional(),
});
export type VoiceActivatedTransactionOutput = z.infer<typeof VoiceActivatedTransactionOutputSchema>;

/**
 * Main function to process voice commands. 
 * Note: This stub is browser-safe for static exports.
 */
export async function voiceActivatedTransaction(input: VoiceActivatedTransactionInput): Promise<VoiceActivatedTransactionOutput> {
  // Client-side logic for portfolio demonstration
  const cmd = input.commandText.toLowerCase();
  
  if (cmd.includes('home') || cmd.includes('dashboard')) {
    return { intent: 'goToPage', entities: { page: 'home' } };
  }
  
  if (cmd.includes('history')) {
    return { intent: 'goToPage', entities: { page: 'history' } };
  }

  if (cmd.includes('service') || cmd.includes('store')) {
    return { intent: 'goToPage', entities: { page: 'services' } };
  }

  return { intent: 'unknown', entities: {} };
}
