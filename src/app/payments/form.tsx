import React, { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addMonths } from "date-fns";
import "../styles/form.css";
import axios from "axios";
import { Payment } from "./types";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseDateFromString, formatDateToNewFormat, formatDateToOldFormat } from "@/lib/dateUtils";

const services = [
  "Lifting HIFU",
  "Peeling acide",
  "ESSENTIEL - Soin du Visage",
  "GOLD - Soin du Visage par Hydrafacial Diamant",
  "DIAMOND - Soin du Visage par Hydrafacial Diamant",
  "PLATINUM - Soin du Visage par Hydrafacial Diamant",
  "Mésothérapie",
  "Peeling Laser",
  "Dépigmentation des sourcils et tatouages avec Pico-Laser",
  "Dépigmentation des taches",
  "Épilation définitive",
  "Épilation à la cire",
  "Élimination au laser des varices fines et de la cupérose",
  "Massage thérapeutique",
  "Raffermissement Corporel par HIFU",
];

const times = ["10h00", "11h00", "12h00", "13h00", "14h00", "15h00", "16h00", "17h00", "18h00"];

const formSchema = z.object({
  name: z.string().min(1, "Nom est requis"),
  surname: z.string().min(1, "Prénom est requis"),
  tel: z.string().min(1, "Numéro de téléphone est requis"),
  email: z.string().email("Email invalide").min(1, "Email est requis"),
  service: z.string().min(1, "Service est requis"),
  data: z.string().min(1, "Date est requise"),
  time: z.string().min(1, "Heure est requise"),
});

type FormData = z.infer<typeof formSchema>;

interface PaymentFormProps {
  data?: Payment[];
  initialData?: Payment;
  onSubmitSuccess?: () => void;
}

export default function PaymentForm({
  data = [],
  initialData,
  onSubmitSuccess,
}: PaymentFormProps) {
  const [reservedDates, setReservedDates] = React.useState<Payment[]>(data);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      surname: "",
      tel: "",
      email: "",
      service: "",
      data: "",
      time: "",
    },
  });

  useEffect(() => {
    setReservedDates(data);
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof FormData, value as string);
      });
    }
  }, [data, initialData, setValue]);

  // ---------------- Helper functions ----------------

  // Verifică dacă ziua este lucrătoare
  const isWeekday = (date: Date) => date.getDay() !== 0;

  // Verifică dacă ora a trecut
  const isTimePast = (time: string, selectedDateStr: string): boolean => {
    if (!selectedDateStr || !time) return false;
    const [hours] = time.split("h").map(Number);
    if (isNaN(hours)) return false;

    const selectedDate = parseDateFromString(selectedDateStr);
    if (!selectedDate) return false;

    const now = new Date();
    if (selectedDate > now) return false;
    if (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()
    ) {
      return hours <= now.getHours();
    }
    return true;
  };

  const selectedDate = watch("data");
  const selectedService = watch("service");

  // ---------------- Submit ----------------
  const onSubmit = async (formData: FormData) => {
    try {
      const payload = {
        ...formData,
        data: formatDateToOldFormat(formData.data), // trimitem format vechi pentru backend
      };

      let response;
      if (initialData?._id) {
        response = await axios.put(
          `https://esthetiquebasilixbackend.onrender.com/tasks/${initialData._id}`,
          payload
        );
        await axios.get(
          "https://esthetiquebasilixbackend.onrender.com/sentemail",
          { params: payload }
        );
      } else {
        response = await axios.post(
          "https://esthetiquebasilixbackend.onrender.com/tasks/save",
          payload
        );
        await axios.get(
          "https://esthetiquebasilixbackend.onrender.com/sentemail",
          { params: payload }
        );
      }

      alert(initialData?._id ? "Mise à jour réussie !" : "Inscription réussie !");

      const newReservation = { ...response.data, _id: initialData?._id || response.data._id };
      setReservedDates((prev) =>
        initialData?._id
          ? prev.map((item) => (item._id === initialData._id ? newReservation : item))
          : [...prev, newReservation]
      );

      if (onSubmitSuccess) onSubmitSuccess();
      if (!initialData) reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Une erreur s'est produite lors de l'enregistrement");
    }
  };

  return (
    <section id="form" className="form">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <input {...register("name")} className="form-control" placeholder="Nom" />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}

        <input {...register("surname")} className="form-control" placeholder="Prénom" />
        {errors.surname && <span className="text-red-500">{errors.surname.message}</span>}

        <input {...register("tel")} type="tel" className="form-control" placeholder="GSM" />
        {errors.tel && <span className="text-red-500">{errors.tel.message}</span>}

        <input {...register("email")} type="email" className="form-control" placeholder="E-mail" />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}

        <select
          {...register("service")}
          className="form-control"
          onChange={(e) => {
            setValue("service", e.target.value);
            setValue("time", "");
          }}
        >
          <option value="">Sélectionner le service</option>
          {services.map((service) => (
            <option key={service} value={service} disabled={service === "Massage thérapeutique"}>
              {service}
            </option>
          ))}
        </select>
        {errors.service && <span className="text-red-500">{errors.service.message}</span>}

        <DatePicker
          selected={parseDateFromString(selectedDate)}
          filterDate={isWeekday}
          minDate={new Date()}
          maxDate={addMonths(new Date(), 2)}
          onChange={(date) => {
            setValue("data", formatDateToNewFormat(date));
            setValue("time", "");
          }}
          className="form-control"
          placeholderText="Date"
          dateFormat="dd-MM-yyyy"
        />
        {errors.data && <span className="text-red-500">{errors.data.message}</span>}

        <select {...register("time")} className="form-control" disabled={!selectedDate || !selectedService}>
          <option value="">Heure</option>
          {times.map((time) => {
            const isReserved = reservedDates.some(
              (reservation) =>
                formatDateToNewFormat(reservation.data) ===
                  formatDateToNewFormat(selectedDate) &&
                reservation.time === time &&
                reservation._id !== initialData?._id
            );
            const timeHasPassed = isTimePast(time, selectedDate);
            return (
              <option key={time} value={time} disabled={isReserved || timeHasPassed}>
                {time}
                {isReserved ? " (Réservé)" : ""}
                {timeHasPassed ? " (Passé)" : ""}
              </option>
            );
          })}
        </select>
        {errors.time && <span className="text-red-500">{errors.time.message}</span>}

        <Button type="submit">{initialData?._id ? "Update" : "Prendre rendez-vous"}</Button>
      </form>
    </section>
  );
}
