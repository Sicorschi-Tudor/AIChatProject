import { Payment } from "../payments/types";

export async function getData(): Promise<Payment[]> {
  const response = await fetch(
    "https://aichat-project-backend.onrender.com/payments"
  );
  return response.json();
}
