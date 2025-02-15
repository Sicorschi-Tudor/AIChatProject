import { Payment } from "../payments/types";

export async function getData(): Promise<Payment[]> {
  const response = await fetch("http://localhost:3001/payments");
  return response.json();
}
