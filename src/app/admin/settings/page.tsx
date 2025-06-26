'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateCredentials } from '../actions';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const credentialsSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newUsername: z.string().min(1, 'New username is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type CredentialsFormValues = z.infer<typeof credentialsSchema>;

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<CredentialsFormValues>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: {
            currentPassword: '',
            newUsername: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit: SubmitHandler<CredentialsFormValues> = async (data) => {
        const result = await updateCredentials(data);
        if (result.success) {
            toast({ 
                title: 'Credentials updated successfully', 
                description: 'Please log out and log back in for the changes to take effect.' 
            });
            form.reset();
        } else {
            const errorMessage = result.error?.formErrors?.join(', ') || 'An unknown error occurred.';
            toast({ title: "Error", description: errorMessage, variant: 'destructive' });
            if (errorMessage.toLowerCase().includes('password')) {
                form.setError("currentPassword", { type: "manual", message: " " }); 
            }
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-6">
                <Button asChild variant="ghost">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin Panel
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>Update your login username and password here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField name="newUsername" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Username</FormLabel>
                                    <FormControl><Input {...field} placeholder="Enter new username" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="currentPassword" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl><Input type="password" {...field} placeholder="Enter your current password" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="newPassword" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} placeholder="Enter new password" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} placeholder="Confirm your new password" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Updating...' : 'Update Credentials'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
