'use client';

import { useCart } from '@/context/CartProvider';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart();

    return (
        <Button size="lg" onClick={() => addToCart(product)}>
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
    );
}
