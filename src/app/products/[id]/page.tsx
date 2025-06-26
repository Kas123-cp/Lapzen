import { getProductsAction } from '@/app/admin/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from '@/components/AddToCartButton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
    const products = await getProductsAction();
    return products.map(product => ({
        id: product.id,
    }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const products = await getProductsAction();
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((src, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <Image
                          src={src}
                          alt={`${product.name} image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && (
                <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </>
            )}
          </Carousel>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant={product.condition === 'New' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-primary/20">
                {product.condition}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-3xl font-headline text-primary font-semibold">
                {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(product.price)}
            </p>
          </div>

          <p className="text-muted-foreground font-body text-lg">{product.description}</p>
          
          <Card>
            <CardContent className="p-6">
                <h3 className="font-headline text-xl font-semibold mb-4">Specifications</h3>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Brand</TableCell>
                            <TableCell>{product.brand}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Processor</TableCell>
                            <TableCell>{product.specs.processor}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">RAM</TableCell>
                            <TableCell>{product.specs.ram}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">Storage</TableCell>
                            <TableCell>{product.specs.storage}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">Display</TableCell>
                            <TableCell>{product.specs.display}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <AddToCartButton product={product} />

        </div>
      </div>
    </div>
  );
}
