
// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview Generates a formatted WhatsApp order message based on cart contents and customer details.
 *
 * - generateWhatsappOrderMessage - A function that generates the WhatsApp message.
 * - GenerateWhatsappOrderMessageInput - The input type for the generateWhatsappOrderMessage function.
 * - GenerateWhatsappOrderMessageOutput - The return type for the generateWhatsappOrderMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWhatsappOrderMessageInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerPhone: z.string().describe('The phone number of the customer.'),
  customerAddress: z.string().describe('The address of the customer.'),
  cartItems: z.array(
    z.object({
      name: z.string().describe('The name of the product.'),
      quantity: z.number().describe('The quantity of the product.'),
      price: z.number().describe('The price of the product in PKR.'),
    })
  ).describe('An array of objects, where each object contains the product name, quantity, and price.'),
});
export type GenerateWhatsappOrderMessageInput = z.infer<typeof GenerateWhatsappOrderMessageInputSchema>;

const GenerateWhatsappOrderMessageOutputSchema = z.object({
  whatsappMessage: z.string().describe('The formatted WhatsApp message with order details.'),
});
export type GenerateWhatsappOrderMessageOutput = z.infer<typeof GenerateWhatsappOrderMessageOutputSchema>;

export async function generateWhatsappOrderMessage(input: GenerateWhatsappOrderMessageInput): Promise<GenerateWhatsappOrderMessageOutput> {
  return generateWhatsappOrderMessageFlow(input);
}

// New input schema for the prompt, including the total
const PromptInputSchema = GenerateWhatsappOrderMessageInputSchema.extend({
  totalAmount: z.string(),
});

const prompt = ai.definePrompt({
  name: 'generateWhatsappOrderMessagePrompt',
  input: { schema: PromptInputSchema }, // Use the new schema
  output: { schema: GenerateWhatsappOrderMessageOutputSchema },
  prompt: `You are an assistant for "Lapzen", an online laptop store. Your task is to generate a formatted WhatsApp order confirmation message.

The message must be friendly, professional, and contain all the details below.
It must explicitly state that payment is Cash on Delivery (COD).

**Order Details**
- **Customer Name:** {{{customerName}}}
- **Customer Phone:** {{{customerPhone}}}
- **Customer Address:** {{{customerAddress}}}

**Items Ordered**
{{#each cartItems}}
- {{{name}}} (x{{{quantity}}}) - PKR {{{price}}} each
{{/each}}

**Total Amount:** {{{totalAmount}}}

Construct the WhatsApp message. Start with a greeting, include all details, state payment is COD, and end with a thank you from Lapzen. Put the final, complete message in the 'whatsappMessage' field of the JSON output.
`,
});

const generateWhatsappOrderMessageFlow = ai.defineFlow(
  {
    name: 'generateWhatsappOrderMessageFlow',
    inputSchema: GenerateWhatsappOrderMessageInputSchema,
    outputSchema: GenerateWhatsappOrderMessageOutputSchema,
  },
  async (input) => {
    // Calculate total here
    const total = input.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalAmount = `PKR ${total.toLocaleString()}`;

    // Create the input for the prompt, including the calculated total
    const promptInput = {
      ...input,
      totalAmount,
    };

    const { output } = await prompt(promptInput);

    if (!output || !output.whatsappMessage) {
      throw new Error("The AI model failed to generate a response. Please try again.");
    }
    return output;
  }
);
    
