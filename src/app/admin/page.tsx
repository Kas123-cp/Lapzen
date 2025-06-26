'use client';

import { useState, type FC, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { getProductsAction, addProduct, updateProduct, deleteProduct } from './actions';
import { Edit, Plus, Trash2, LogOut, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  condition: z.enum(['New', 'Used', 'Refurbished']),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, "You can upload a maximum of 5 images."),
  specs: z.object({
    processor: z.string().min(1, 'Processor is required'),
    ram: z.string().min(1, 'RAM is required'),
    storage: z.string().min(1, 'Storage is required'),
    display: z.string().min(1, 'Display size is required'),
    battery: z.string().min(1, 'Battery info is required'),
  }),
  description: z.string().min(1, 'Description is required'),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm: FC<{ product?: Product; onFinished: () => void }> = ({ product, onFinished }) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string[]>(product?.images ?? []);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: '',
      brand: '',
      price: 0,
      condition: 'New',
      images: [],
      specs: { processor: '', ram: '', storage: '', display: '', battery: '' },
      description: '',
      featured: false,
      newArrival: false,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = form.getValues('images') || [];
    if (currentImages.length + files.length > 5) {
      toast({
        title: "Image limit exceeded",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      e.target.value = ""; // Clear the file input
      return;
    }

    const newImagePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const newImageUrls = await Promise.all(newImagePromises);
      const allImages = [...currentImages, ...newImageUrls];
      setImagePreview(allImages);
      form.setValue('images', allImages, { shouldValidate: true });
    } catch (error) {
      toast({
        title: "Error reading files",
        description: "There was an issue processing your images.",
        variant: "destructive"
      });
    } finally {
        e.target.value = ""; // Clear the file input for re-selection
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = imagePreview.filter((_, index) => index !== indexToRemove);
    setImagePreview(updatedImages);
    form.setValue('images', updatedImages, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    const result = product ? await updateProduct(product.id, data) : await addProduct(data);
    if (result.success) {
      toast({ title: `Product ${product ? 'updated' : 'added'} successfully` });
      onFinished();
      form.reset();
      setImagePreview([]);
    } else {
      const formErrors = result.error?.formErrors ?? [];
      const errorMessage = formErrors.length > 0 ? formErrors.join(', ') : 'An unknown error occurred.';
      toast({ title: "Error", description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Laptop Name</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. MacBook Pro 14" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="brand" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Apple" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
           <FormField name="price" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Price (PKR)</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="condition" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Card>
            <CardHeader><CardTitle className="text-lg">Specifications</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="specs.processor" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Processor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="specs.ram" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>RAM</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="specs.storage" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Storage</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="specs.display" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Screen Size</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="specs.battery" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Battery Info</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
        </Card>
        <FormField name="description" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormItem>
          <FormLabel>Laptop Photos (up to 5)</FormLabel>
          <FormControl>
            <Input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg" 
                multiple 
                onChange={handleImageChange}
                disabled={imagePreview.length >= 5}
            />
          </FormControl>
          <FormMessage />
           {imagePreview.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {imagePreview.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                    <Image 
                        src={src} 
                        alt={`Preview ${i + 1}`}
                        fill
                        className="rounded-md object-cover" 
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removeImage(i)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
          )}
        </FormItem>
        <div className="flex items-center space-x-4">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newArrival"
              render={({ field }) => (
                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>New Arrival</FormLabel>
                  </div>
                </FormItem>
              )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
        </Button>
      </form>
    </Form>
  );
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const fetchedProducts = await getProductsAction();
        setProducts(fetchedProducts);
    } catch (error) {
        toast({ title: 'Failed to fetch products', variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      toast({ title: 'Logged out successfully' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Logout failed', variant: 'destructive' });
    }
  };

  const onFormFinished = () => {
    fetchProducts();
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setEditingProduct(undefined);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
      const result = await deleteProduct(id);
      if(result.success) {
          toast({ title: 'Product deleted successfully' });
          fetchProducts();
      } else {
          toast({ title: 'Error deleting product', description: result.error, variant: 'destructive'});
      }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
                <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Products</CardTitle>
           <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add New Laptop</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add a New Product</DialogTitle></DialogHeader>
              <ProductForm onFinished={onFormFinished} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                  ))
               ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>PKR {product.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isEditDialogOpen && editingProduct?.id === product.id} onOpenChange={(isOpen) => { if(!isOpen) { setEditingProduct(undefined); setEditDialogOpen(false); } else { setEditDialogOpen(true); }}}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Edit className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                                {editingProduct && <ProductForm product={editingProduct} onFinished={onFormFinished} />}
                            </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the product and its images.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
