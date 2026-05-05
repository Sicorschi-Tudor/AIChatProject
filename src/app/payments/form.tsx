import React, { useEffect, useCallback } from "react";
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

const API_BASE = "https://esthetiquebasilixbackend.onrender.com";

const services = [
  "Lifting HIFU",
  "RADIANCE - Traitement à l'ADN de saumon",
  "Peeling acide",
  "ESSENTIEL - Soin du Visage",
  "GOLD - Soin du Visage par Hydrafacial Diamant",
  "DIAMOND - Soin du Visage par Hydrafacial Diamant",
  "PLATINUM - Soin du Visage par Hydrafacial Diamant",
  "Mésothérapie",
  "Peeling Laser",
  "Dépigmentation des sourcils et tatouages avec Pico-Laser",
  "Dépigmentation des taches avec Pico-Laser",
  "Épilation définitive",
  "Épilation à la cire",
  "Élimination au laser des varices fines et de la cupérose",
  "Massage thérapeutique",
  "Cryothérapie",
  "Remodelage Corporel",
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error-taken" | "error-generic">("idle");

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

  // Populează forma când se deschide modal-ul de editare
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof FormData, value as string);
      });
    }
  }, [initialData, setValue]);

  // Fetch rezervări direct din API (nu din props) pentru a fi mereu actualizat
  const getReservedDates = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/get`);
      setReservedDates(res.data);
    } catch (err) {
      console.error("Error fetching reserved dates:", err);
    }
  }, []);

  useEffect(() => {
    getReservedDates();
  }, [getReservedDates]);

  const selectedDate = watch("data");
  const selectedService = watch("service");

  // Refresh ore disponibile când se schimbă data selectată
  useEffect(() => {
    if (selectedDate) {
      getReservedDates();
    }
  }, [selectedDate, getReservedDates]);

  // ---- Helper functions ----

  const isWeekday = (date: Date) => date.getDay() !== 0;

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

  const BLOCKED_FROM = new Date(2026, 5, 1); // 1 iunie 2026 — toate miercurile din iunie+ sunt blocate

  const isWednesdayBlocked = (dateStr: string): boolean => {
    const d = parseDateFromString(dateStr);
    if (!d) return false;
    d.setHours(0, 0, 0, 0);
    return d.getDay() === 3 && d >= BLOCKED_FROM;
  };

  // ---- Submit ----
  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const payload = {
        ...formData,
        data: formatDateToOldFormat(formData.data),
      };

      if (initialData?._id) {
        // ---- EDITARE ----
        await axios.put(`${API_BASE}/tasks/${initialData._id}`, payload);

        // La update, backend-ul nu trimite email automat — îl trimitem după confirmare reușită
        await axios.get(`${API_BASE}/sentemail`, { params: payload });

        setSubmitStatus("success");
        await getReservedDates();
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        // ---- CREARE ----
        // Backend trimite automat emailul de confirmare după inserare confirmată în DB
        await axios.post(`${API_BASE}/tasks/save`, payload);

        setSubmitStatus("success");
        await getReservedDates();
        if (onSubmitSuccess) onSubmitSuccess();
        reset();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      if (error?.response?.status === 409) {
        setSubmitStatus("error-taken");
      } else {
        setSubmitStatus("error-generic");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="form" className="form">
      {/* Status messages */}
      {submitStatus === "success" && (
        <div style={{ background: "#d4edda", color: "#155724", padding: "10px 14px", borderRadius: "6px", marginBottom: "12px", border: "1px solid #c3e6cb" }}>
          {initialData?._id
            ? "✓ Mise à jour réussie ! Un email de confirmation a été envoyé au client."
            : "✓ Inscription réussie ! Un email de confirmation a été envoyé automatiquement au client."}
        </div>
      )}
      {submitStatus === "error-taken" && (
        <div style={{ background: "#fff3cd", color: "#856404", padding: "10px 14px", borderRadius: "6px", marginBottom: "12px", border: "1px solid #ffc107" }}>
          ⚠ Ce créneau horaire est déjà réservé. Veuillez choisir une autre date ou heure.
        </div>
      )}
      {submitStatus === "error-generic" && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 14px", borderRadius: "6px", marginBottom: "12px", border: "1px solid #f5c6cb" }}>
          ✕ Une erreur s'est produite. Veuillez réessayer.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" onChange={() => setSubmitStatus("idle")}>
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
            setSubmitStatus("idle");
          }}
        >
          <option value="">Sélectionner le service</option>
          {services.map((service) => (
            <option key={service} value={service}>
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
            setSubmitStatus("idle");
          }}
          className="form-control"
          placeholderText="Date"
          dateFormat="dd-MM-yyyy"
        />
        {errors.data && <span className="text-red-500">{errors.data.message}</span>}

        <select
          {...register("time")}
          className="form-control"
          disabled={!selectedDate || !selectedService}
          onChange={(e) => {
            setValue("time", e.target.value);
            setSubmitStatus("idle");
          }}
        >
          <option value="">Heure</option>
          {times.map((time) => {
            const isReserved = reservedDates.some(
              (reservation) =>
                formatDateToNewFormat(reservation.data) === formatDateToNewFormat(selectedDate) &&
                reservation.time === time &&
                reservation._id !== initialData?._id
            );
            const timeHasPassed = isTimePast(time, selectedDate);
            const blockedWednesday = isWednesdayBlocked(selectedDate);
            const isDisabled = isReserved || timeHasPassed || blockedWednesday;
            return (
              <option key={time} value={time} disabled={isDisabled}>
                {time}
                {isReserved || blockedWednesday ? " (Réservé)" : ""}
                {timeHasPassed ? " (Passé)" : ""}
              </option>
            );
          })}
        </select>
        {errors.time && <span className="text-red-500">{errors.time.message}</span>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "En cours..."
            : initialData?._id
            ? "Mettre à jour"
            : "Prendre rendez-vous"}
        </Button>
      </form>
    </section>
  );
}
