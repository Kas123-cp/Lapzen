
'use server';

import { generateWhatsappOrderMessage } from '@/ai/flows/generate-whatsapp-order-message';
import type { CartItem } from '@/lib/types';
import { z } from 'zod';

const checkoutSchema = z.object({
    customerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    customerPhone: z.string().min(10, { message: "Please enter a valid phone number." }),
    customerAddress: z.string().min(10, { message: "Please enter a valid address." }),
});

export async function createWhatsappOrderMessage(
    cartItems: CartItem[],
    data: {
        customerName: string;
        customerPhone: string;
        customerAddress: string;
    }
) {
    const validationResult = checkoutSchema.safeParse(data);

    if (!validationResult.success) {
        return { 
            success: false, 
            error: validationResult.error.flatten().fieldErrors 
        };
    }
    
    if (cartItems.length === 0) {
        return { success: false, error: { cart: ['Your cart is empty.'] } };
    }

    try {
        const input = {
            ...data,
            cartItems: cartItems.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            }))
        };

        const result = await generateWhatsappOrderMessage(input);

        if (!result.whatsappMessage) {
            throw new Error('The AI model returned an empty message. Please try again.');
        }

        return { success: true, message: result.whatsappMessage };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Error generating WhatsApp message:", error);
        return { 
            success: false, 
            error: { server: [error.message || 'Failed to generate order message. Please try again.'] } 
        };
    }
}
    