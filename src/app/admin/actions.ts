'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import type { Product } from '@/lib/types';
import { getAuthCredentials, saveAuthCredentials } from '@/lib/auth';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  condition: z.enum(['New', 'Used', 'Refurbished']),
  images: z.array(z.string()).min(1, 'At least one image is required').max(5, 'You can upload a maximum of 5 images'),
  specs: z.object({
    processor: z.string().min(1, 'Processor is required'),
    ram: z.string().min(1, 'RAM is required'),
    storage: z.string().min(1, 'Storage is required'),
    display: z.string().min(1, 'Display size is required'),
    battery: z.string().min(1, 'Battery info is required'),
  }),
  description: z.string().min(1, 'Description is required'),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
});

// Helper to upload a data URI to Firebase Storage
async function uploadImage(dataUri: string, productId: string): Promise<string> {
  if (!dataUri.startsWith('data:image')) {
    return dataUri; // It's an existing URL, not a new file
  }

  const matches = dataUri.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URI format');
  }

  const [, mimeType, base64Data] = matches;
  const fileExtension = mimeType.split('/')[1] ?? 'png';
  
  const storageRef = ref(storage, `products/${productId}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`);
  
  await uploadString(storageRef, base64Data, 'base64', { contentType: mimeType });
  
  return getDownloadURL(storageRef);
}


export async function addProduct(data: unknown) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  
  try {
    const tempId = `prod_${Date.now()}`;
    const imageUrls = await Promise.all(result.data.images.map(image => uploadImage(image, tempId)));

    const newProduct = {
      ...result.data,
      images: imageUrls,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'products'), newProduct);

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Failed to add product:', error);
    return { success: false, error: { formErrors: ['Failed to save product to the database.'] } };
  }
}

export async function updateProduct(id: string, data: unknown) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  
  try {
    const productDocRef = doc(db, "products", id);
    const existingDoc = await getDoc(productDocRef);
    if (!existingDoc.exists()) {
        return { success: false, error: { formErrors: ["Product not found"] } };
    }

    const existingImages = existingDoc.data().images || [];
    const submittedImages = result.data.images;

    const newImageUrls = await Promise.all(
        submittedImages.map(img => img.startsWith('data:image') ? uploadImage(img, id) : Promise.resolve(img))
    );

    // Clean up old images that were removed
    const imagesToDelete = existingImages.filter((img: string) => !newImageUrls.includes(img));
    for (const imageUrl of imagesToDelete) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (err: any) {
            if (err.code !== 'storage/object-not-found') {
                console.error(`Failed to delete old image from storage: ${imageUrl}`, err);
            }
        }
    }
    
    const updatedProductData = {
      ...result.data,
      images: newImageUrls,
    };

    await updateDoc(productDocRef, updatedProductData);

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error: { formErrors: ['Failed to update product in the database.'] } };
  }
}

export async function deleteProduct(id: string) {
  try {
    const productDocRef = doc(db, 'products', id);
    const productDoc = await getDoc(productDocRef);
    if (!productDoc.exists()) {
      return { success: false, error: 'Product not found' };
    }
    
    const productToDelete = productDoc.data() as Omit<Product, 'id'>;

    // Delete associated images from Firebase Storage
    if (productToDelete.images && productToDelete.images.length > 0) {
      for (const imageUrl of productToDelete.images) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (err: any) {
            if (err.code !== 'storage/object-not-found') {
                console.error(`Failed to delete image from storage: ${imageUrl}`, err);
            }
        }
      }
    }
    
    await deleteDoc(productDocRef);

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
     console.error('Failed to delete product:', error);
    return { success: false, error: 'Failed to delete product.' };
  }
}

export async function getProductsAction(): Promise<Product[]> {
    try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, orderBy('createdAt', 'desc'));
        const productSnapshot = await getDocs(q);
        const productList = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
        return productList;
    } catch (error) {
        console.error("Error fetching products from Firestore:", error);
        return [];
    }
}


// --- Auth Logic ---

const credentialsSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newUsername: z.string().min(1, 'New username is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function updateCredentials(data: unknown) {
  const result = credentialsSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }

  try {
    const currentCreds = await getAuthCredentials();
    
    // In a real app, you would hash and compare passwords.
    if (result.data.currentPassword !== currentCreds.password) {
        return { success: false, error: { formErrors: ['Incorrect current password.'] } };
    }

    const newCreds = {
        username: result.data.newUsername,
        password: result.data.newPassword,
    };

    await saveAuthCredentials(newCreds);

    revalidatePath('/admin/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update credentials:', error);
    return { success: false, error: { formErrors: ['Failed to update credentials.'] } };
  }
}
