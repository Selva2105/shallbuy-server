export interface CreateOrderData {
  total: number;
  shippingAddressId: string;
  paymentMethod: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
    sellerId: string;
    image: string;
  }[];
}
