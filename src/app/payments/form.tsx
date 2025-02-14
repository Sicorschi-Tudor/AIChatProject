"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema, FormValues, UserFormProps } from "./types";
import { generateId } from "./utils";

export default function PaymentForm({ payment }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormValues) {
    const payload = { ...data, id: payment?.id || generateId() };

    if (payment) {
      await fetch(`/api/users/${payment.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">Payment Form</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input {...register("name")} placeholder="Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <Input {...register("mobile")} placeholder="Mobile" />
        {errors.mobile && (
          <p className="text-red-500">{errors.mobile.message}</p>
        )}

        <Input {...register("amount")} placeholder="Amount" />
        {errors.amount && (
          <p className="text-red-500">{errors.amount.message}</p>
        )}

        <Select {...register("status")}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-red-500">{errors.status.message}</p>
        )}

        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}
