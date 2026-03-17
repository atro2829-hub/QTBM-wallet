'use server';
/**
 * @fileOverview This file defines a Genkit flow for processing voice commands.
 * It interprets user voice commands to identify their intent (e.g., sending money,
 * depositing funds, navigating the app) and extracts relevant entities
 * (like amount, currency, recipient UID) to facilitate hands-free interaction with the QTBM Wallet.
 *
 * - voiceActivatedTransaction - The main function to process a voice command.
 * - VoiceActivatedTransactionInput - The input type for the voiceActivatedTransaction function.
 * - VoiceActivatedTransactionOutput - The return type for the voiceActivatedTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceActivatedTransactionInputSchema = z.object({
  commandText: z.string().describe('The transcribed voice command from the user.'),
});
export type VoiceActivatedTransactionInput = z.infer<typeof VoiceActivatedTransactionInputSchema>;

const VoiceActivatedTransactionOutputSchema = z.object({
  intent: z.enum(['sendMoney', 'deposit', 'servicePayment', 'goToPage', 'unknown']).describe('The identified intent from the voice command.'),
  entities: z.object({
    amount: z.number().optional().describe('The numerical amount of the transaction.'),
    currency: z.enum(['YER', 'USD', 'SAR']).optional().describe('The currency (YER, USD, SAR) of the transaction.'),
    recipientUid: z.string().optional().describe('The User ID (UID) of the recipient for transfers.'),
    page: z.enum(['home', 'services', 'history', 'settings']).optional().describe('The page to navigate to.'),
    serviceName: z.string().optional().describe('The name of the service for payment.'),
  }).optional().describe('Extracted entities relevant to the intent.'),
});
export type VoiceActivatedTransactionOutput = z.infer<typeof VoiceActivatedTransactionOutputSchema>;

const voiceCommandPrompt = ai.definePrompt({
  name: 'voiceCommandPrompt',
  input: {schema: VoiceActivatedTransactionInputSchema},
  output: {schema: VoiceActivatedTransactionOutputSchema},
  prompt: `You are an AI assistant for the QTBM Wallet application. Your task is to interpret user voice commands, identify their intent, and extract relevant entities.

Available Currencies: YER, USD, SAR
Available Pages: home, services, history, settings

Here are the possible intents and their required/optional entities:

1.  **sendMoney**: To transfer funds to another user.
    *   Required entities: \`amount\` (number), \`currency\` (YER, USD, SAR), \`recipientUid\` (string, the user ID).
    *   Example: "Send 50 dollars to user123", "Transfer 100 SAR to JohnDoe45"

2.  **deposit**: To initiate a fund deposit request.
    *   Required entities: \`amount\` (number), \`currency\` (YER, USD, SAR).
    *   Example: "Deposit 200 YER", "Recharge my wallet with 75 USD"

3.  **servicePayment**: To pay for a service.
    *   Required entities: \`serviceName\` (string).
    *   Optional entities: \`amount\` (number), \`currency\` (YER, USD, SAR).
    *   Example: "Pay for Spotify subscription", "Buy 100 game credits for 10 USD"

4.  **goToPage**: To navigate to a specific section of the app.
    *   Required entities: \`page\` (home, services, history, settings).
    *   Example: "Go to my settings", "Show me my transaction history", "Open the home page"

5.  **unknown**: If the command cannot be clearly understood or matched to any of the above intents.
    *   No specific entities. The 'entities' object should be an empty object or omitted.
    *   Example: "Tell me a joke", "What's the weather like?"

Your output must be a JSON object with two fields: \`intent\` and \`entities\`.
If an entity is not specified or cannot be extracted, omit it from the \`entities\` object. If the \`intent\` is 'unknown', the \`entities\` object should be an empty object.
When extracting currencies, map "dollars" or "USD" to "USD", "Saudi Riyals" or "SAR" to "SAR", and "Yemeni Riyals" or "YER" to "YER". If just "riyals" is mentioned, assume "SAR" unless the context strongly implies YER.

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
