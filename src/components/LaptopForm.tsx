'use client';

import { useState, type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { addProduct, updateProduct } from '@/app/admin/actions';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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

interface LaptopFormProps {
  product?: Product;
  onFinished: () => void;
}

const LaptopForm: FC<LaptopFormProps> = ({ product, onFinished }) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string[]>(product?.images ?? []);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: '',
      brand: '',
      price: NaN, // Use NaN for an empty number field
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
              <FormControl>
                <Input
                    type="number"
                    {...field}
                    value={isNaN(field.value) ? '' : field.value} 
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
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

export default LaptopForm;
