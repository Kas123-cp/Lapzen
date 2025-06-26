'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import type { Product } from '@/lib/types';
import { Frown } from 'lucide-react';
import { getProductsAction } from '@/app/admin/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Default max price, will be updated when products are loaded
    const [maxPrice, setMaxPrice] = useState(1000000);
    
    const [filters, setFilters] = useState<{
        brand: string;
        priceRange: [number, number];
        conditions: string[];
        processor: string;
        ram: string;
    }>({
        brand: '',
        priceRange: [0, maxPrice],
        conditions: [],
        processor: '',
        ram: '',
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const products = await getProductsAction();
            setAllProducts(products);
            const newMaxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000000;
            setMaxPrice(newMaxPrice);
            // Update the filter's price range with the actual max price from data
            setFilters(prev => ({ ...prev, priceRange: [0, newMaxPrice] }));
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const handleFilterChange = (filterType: string, value: any) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterType]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            brand: '',
            priceRange: [0, maxPrice],
            conditions: [],
            processor: '',
            ram: '',
        });
    };

    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const brandMatch = filters.brand === '' || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
            const priceMatch = product.price <= filters.priceRange[1];
            const conditionMatch = filters.conditions.length === 0 || filters.conditions.includes(product.condition);
            const processorMatch = filters.processor === '' || product.specs.processor.toLowerCase().includes(filters.processor.toLowerCase());
            const ramMatch = filters.ram === '' || product.specs.ram.toLowerCase().includes(filters.ram.toLowerCase());
            
            return brandMatch && priceMatch && conditionMatch && processorMatch && ramMatch;
        });
    }, [filters, allProducts]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold font-headline">Our Collection</h1>
                <p className="text-lg text-muted-foreground mt-2">Browse our full range of premium laptops</p>
            </div>
            <div className="grid lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <ProductFilters 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onResetFilters={handleResetFilters}
                        maxPrice={maxPrice}
                    />
                </aside>
                <main className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {Array.from({length: 6}).map((_, i) => (
                               <Card key={i} className="flex flex-col h-full overflow-hidden">
                                   <Skeleton className="aspect-[4/3] w-full"/>
                                   <CardContent className="p-4 flex-grow">
                                       <Skeleton className="h-5 w-3/4 mb-2"/>
                                       <Skeleton className="h-4 w-full"/>
                                   </CardContent>
                                   <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                       <Skeleton className="h-6 w-24"/>
                                       <Skeleton className="h-8 w-20"/>
                                   </CardFooter>
                               </Card>
                           ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[40vh] bg-card rounded-lg p-8">
                            <Frown className="w-16 h-16 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-headline font-semibold">No Laptops Found</h2>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
