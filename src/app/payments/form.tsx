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

const services = [
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
];
const times = [
  "10h00",
  "11h00",
  "12h00",
  "13h00",
  "14h00",
  "15h00",
  "16h00",
  "17h00",
  "18h00",
];

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
  onSubmitSuccess?: () => void; // Changed to void since we're using refetch
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

  const onSubmit = async (formData: FormData) => {
    try {
      let response;
      if (initialData?._id) {
        response = await axios.put(
          `https://esthetiquebasilixbackend.onrender.com/tasks/${initialData._id}`,
          formData
        );
      } else {
        response = await axios.post(
          "https://esthetiquebasilixbackend.onrender.com/tasks/save",
          formData
        );
      }

      alert(
        initialData?._id ? "Mise à jour réussie !" : "Inscription réussie !"
      );

      // Update local reserved dates
      const newReservation = {
        ...response.data,
        _id: initialData?._id || response.data._id,
      };
      setReservedDates((prev) => {
        if (initialData?._id) {
          return prev.map((item) =>
            item._id === initialData._id ? newReservation : item
          );
        }
        return [...prev, newReservation];
      });

      // Trigger refetch instead of passing data back
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      if (!initialData) reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Une erreur s'est produite lors de l'enregistrement");
    }
  };

  const dataToString = (data: Date | null | string): string => {
    if (!data) return "";
    const date = typeof data === "string" ? new Date(data) : data;
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0;
  };

  const isTimePast = (time: string, selectedDateStr: string): boolean => {
    if (!selectedDateStr || !time) return false;
    try {
      const [hours] = time.split("h").map(Number);
      if (isNaN(hours)) return false;
      const selectedDate = new Date(selectedDateStr);
      selectedDate.setHours(0, 0, 0, 0);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() > currentDate.getTime()) return false;
      if (selectedDate.getTime() === currentDate.getTime()) {
        const now = new Date();
        return hours <= now.getHours();
      }
      return true;
    } catch (e) {
      console.error("Error parsing date/time:", e);
      return false;
    }
  };

  const selectedDate = watch("data");
  const selectedService = watch("service");

  return (
    <section id="form" className="form">
      <form
        onSubmit={handleSubmit(onSubmit)}
        id="form-element"
        className="flex flex-col"
      >
        <input
          {...register("name")}
          className="form-control"
          placeholder="Nom"
          required
        />
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}

        <input
          {...register("surname")}
          className="form-control"
          placeholder="Prénom"
          required
        />
        {errors.surname && (
          <span className="text-red-500">{errors.surname.message}</span>
        )}

        <input
          {...register("tel")}
          type="tel"
          className="form-control"
          placeholder="GSM"
          required
        />
        {errors.tel && (
          <span className="text-red-500">{errors.tel.message}</span>
        )}

        <input
          {...register("email")}
          type="email"
          className="form-control"
          placeholder="E-mail"
          required
        />
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}

        <select
          {...register("service")}
          className="form-control"
          required
          onChange={(e) => {
            setValue("service", e.target.value);
            setValue("time", "");
          }}
        >
          <option value="">Sélectionner le service</option>
          {services.map((service) => (
            <option
              key={service}
              value={service}
              disabled={service === "Massage thérapeutique"}
            >
              {service}
            </option>
          ))}
        </select>
        {errors.service && (
          <span className="text-red-500">{errors.service.message}</span>
        )}

        <DatePicker
          selected={selectedDate ? new Date(selectedDate) : null}
          filterDate={isWeekday}
          minDate={new Date()}
          excludeDates={[new Date("2024-08-15")]}
          maxDate={addMonths(new Date(), 2)}
          onChange={(date: Date | null) => {
            setValue("data", dataToString(date));
            setValue("time", "");
          }}
          className="form-control"
          placeholderText="Date"
          dateFormat="yyyy-MM-dd"
          required
        />
        {errors.data && (
          <span className="text-red-500">{errors.data.message}</span>
        )}

        <select
          {...register("time")}
          className="form-control"
          disabled={!selectedDate || !selectedService}
          required
        >
          <option value="">Heure</option>
          {times.map((time) => {
            const isReserved = reservedDates.some(
              (reservation) =>
                reservation.data === selectedDate &&
                reservation.time === time &&
                reservation._id !== initialData?._id
            );
            const timeHasPassed = isTimePast(time, selectedDate);
            const isDisabled = isReserved || timeHasPassed;

            return (
              <option key={time} value={time} disabled={isDisabled}>
                {time}
                {isReserved ? " (Réservé)" : ""}
                {timeHasPassed ? " (Passé)" : ""}
              </option>
            );
          })}
        </select>
        {errors.time && (
          <span className="text-red-500">{errors.time.message}</span>
        )}

        <Button type="submit">
          {initialData?._id ? "Update" : "Prendre rendez-vous"}
        </Button>
      </form>
    </section>
  );
}
