export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  condition: 'New' | 'Used' | 'Refurbished';
  images: string[];
  specs: {
    processor: string;
    ram: string;
    storage: string;
    display: string;
    battery: string;
  };
  description: string;
  featured?: boolean;
  newArrival?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
