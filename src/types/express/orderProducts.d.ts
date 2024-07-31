export interface OrderData {
  address: {
    street: string;
    city: string;
    district: string;
    state: string;
    country: string;
    pincode: string;
  };
  name: string;
  phoneNumber: string;
  email: string;
  deliveryInstruction?: string;
  products: string[];
}
