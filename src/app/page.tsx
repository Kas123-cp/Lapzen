import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { getProductsAction } from '@/app/admin/actions';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const products = await getProductsAction();
  const featuredProducts = products.filter(p => p.featured).slice(0, 3);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 3);

  return (
    <div className="space-y-16 md:space-y-24 pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tight">
              Find Your <span className="text-primary">Perfect</span> Laptop
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
              Discover top-tier new and pre-loved laptops from the world's leading brands. Unmatched quality, unbeatable prices.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button asChild size="lg" className="font-bold">
                <Link href="/products">Shop All Laptops <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">About Us</Link>
              </Button>
            </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Laptops</h2>
            <p className="text-lg text-muted-foreground mt-2">Handpicked for performance and value</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      
      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
         <section className="bg-card py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">New Arrivals</h2>
                <p className="text-lg text-muted-foreground mt-2">Check out the latest additions to our collection</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
            </div>
         </section>
      )}

      {/* All Products Section */}
      {products.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">All Our Laptops</h2>
            <p className="text-lg text-muted-foreground mt-2">Browse the complete collection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
