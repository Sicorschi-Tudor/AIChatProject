import { Payment } from "../payments/types";
import { parseDateFromString, formatDateToOldFormat } from "@/lib/dateUtils";

export async function getData(): Promise<Payment[]> {
  const response = await fetch(
    "https://esthetiquebasilixbackend.onrender.com/tasks/get"
  );
  const data: Payment[] = await response.json();

  // Obține data de azi
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Formatarea datei în "YYYY-MM-DD" pentru comparație
  const yesterdayStr = formatDateToOldFormat(yesterday);

  // Filtrare: doar înregistrările cu data >= ieri
  // Convertește toate datele la format vechi pentru comparație
  return data.filter((payment) => {
    const paymentDate = parseDateFromString(payment.data);
    if (!paymentDate) return false;
    
    const paymentDateStr = formatDateToOldFormat(paymentDate);
    return paymentDateStr >= yesterdayStr;
  });
}
