"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formSchema, FormValues, UserFormProps } from "./types";
import { generateId } from "./utils";

export default function PaymentForm({
  payment,
  onSubmitSuccess,
}: UserFormProps & { onSubmitSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    const payload = { ...data, id: payment?.id || generateId() };

    try {
      const response = await fetch(
        "https://aichat-project-backend.onrender.com/payment/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      console.log("Data submitted successfully!");
      alert("Data has been successfully recorded!");
      reset();

      onSubmitSuccess();
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setIsLoading(false);
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

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
          )}
        />
        {errors.status && (
          <p className="text-red-500">{errors.status.message}</p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Add"}
        </Button>
      </form>

      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-500 opacity-50 z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
    </div>
  );
}
