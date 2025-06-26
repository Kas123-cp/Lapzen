import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
            <Link href={`/products/${product.id}`} className='flex-1'>
                <CardTitle className="font-headline text-lg mb-2 leading-tight hover:text-primary transition-colors">
                    {product.name}
                </CardTitle>
            </Link>
            <Badge variant={product.condition === 'New' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-primary/20 shrink-0">
                {product.condition}
            </Badge>
        </div>
        <p className="font-body text-muted-foreground text-sm line-clamp-2">
          {product.specs.processor} • {product.specs.ram} RAM • {product.specs.storage}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="font-headline text-xl font-semibold text-primary">
          {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(product.price)}
        </p>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/products/${product.id}`}>
            View <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
