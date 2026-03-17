
'use server';
/**
 * @fileOverview AI-powered voice command processor for QTBM Wallet.
 * Handles intent extraction and entity identification for hands-free financial operations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const voiceCommandPrompt = ai.definePrompt({
  name: 'voiceCommandPrompt',
  input: {schema: VoiceActivatedTransactionInputSchema},
  output: {schema: VoiceActivatedTransactionOutputSchema},
  prompt: `You are an AI assistant for the QTBM Wallet application. Interpret user voice commands to identify their intent and extract entities.

Currencies: YER, USD, SAR
Pages: home, services, history, settings

Intents:
- sendMoney (amount, currency, recipientUid)
- deposit (amount, currency)
- servicePayment (serviceName, amount, currency)
- goToPage (page)

User command: {{{commandText}}}`,
});

const voiceActivatedTransactionFlow = ai.defineFlow(
  {
    name: 'voiceActivatedTransactionFlow',
    inputSchema: VoiceActivatedTransactionInputSchema,
    outputSchema: VoiceActivatedTransactionOutputSchema,
  },
  async (input) => {
    const {output} = await voiceCommandPrompt(input);
    return output!;
  }
);

export async function voiceActivatedTransaction(input: VoiceActivatedTransactionInput): Promise<VoiceActivatedTransactionOutput> {
  return voiceActivatedTransactionFlow(input);
}
