'use client';
import {useState , type FC , useEffect} from 'react'
import Image from 'next/image':
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { getProductsAction, deleteProduct } from './actions';
import { Edit, Plus, Trash2, LogOut, Settings } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import LaptopForm from '@/components/LaptopForm';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  const onEditFormFinished = () => {
    fetchProducts();
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
          <Button asChild>
            <Link href="/admin/upload">
              <Plus className="mr-2 h-4 w-4" /> Add New Laptop
            </Link>
          </Button>
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
                                {editingProduct && <LaptopForm product={editingProduct} onFinished={onEditFormFinished} />}
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
