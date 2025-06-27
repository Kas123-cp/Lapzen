'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LaptopForm from '@/components/LaptopForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function UploadPage() {
    const router = useRouter();

    const handleFormFinished = () => {
        // After successfully adding a product, go back to the main admin page
        router.push('/admin');
    };

    return (
        <div className="container mx-auto py-10 max-w-3xl">
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
                    <CardTitle>Add New Product</CardTitle>
                    <CardDescription>Fill out the form below to add a new laptop to the database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LaptopForm onFinished={handleFormFinished} />
                </CardContent>
            </Card>
        </div>
    );
}

