import { Payment } from "../payments/types";

export async function getData(): Promise<Payment[]> {
  const response = await fetch(
    "https://esthetiquebasilixbackend.onrender.com/tasks/get"
  );
  const data: Payment[] = await response.json();

  // Obține data de azi
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Formatarea datei în "YYYY-MM-DD"
  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const yesterdayStr = formatDate(yesterday);

  // Filtrare: doar înregistrările cu data >= ieri
  return data.filter((payment) => payment.data >= yesterdayStr);
}
