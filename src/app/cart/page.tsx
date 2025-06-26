'use client';

import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createWhatsappOrderMessage } from './actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "A valid phone number is required"),
  customerAddress: z.string().min(10, "A valid address is required"),
});

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    setIsSubmitting(true);
    const result = await createWhatsappOrderMessage(cartItems, values);
    
    if (result.success && result.message) {
      const whatsappNumber = "92309009022";
      const encodedMessage = encodeURIComponent(result.message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      toast({
          title: "Order Prepared!",
          description: "Redirecting to WhatsApp to send your order.",
      });

      window.open(whatsappUrl, '_blank');
      clearCart();
      form.reset();

    } else {
        toast({
            title: "Error",
            description: "Could not create order message. Please try again.",
            variant: "destructive",
        })
      console.error("Order submission failed", result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-semibold font-headline">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-6">
                <Link href="/products">Start Shopping</Link>
            </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
          <div className="lg:col-span-2 space-y-4">
             {cartItems.map(item => (
                <Card key={item.product.id} className="flex items-center p-4">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden">
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" data-ai-hint="laptop computer"/>
                    </div>
                    <div className="ml-4 flex-grow">
                        <Link href={`/products/${item.product.id}`} className="font-semibold font-headline hover:text-primary">{item.product.name}</Link>
                        <p className="text-sm text-muted-foreground">PKR {item.product.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <span>{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">PKR {(item.product.price * item.quantity).toLocaleString()}</p>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive mt-2" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </Card>
             ))}
          </div>
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span>Subtotal ({cartCount} items)</span>
                        <span>PKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>PKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Payment will be Cash on Delivery (COD).</p>
                </CardContent>
                <CardFooter>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                            <FormField control={form.control} name="customerName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="customerPhone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl><Input placeholder="03001234567" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="customerAddress" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Delivery Address</FormLabel>
                                    <FormControl><Input placeholder="Your full address" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Order on WhatsApp'}
                            </Button>
                        </form>
                    </Form>
                </CardFooter>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
