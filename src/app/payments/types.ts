import { ColumnDef } from "@tanstack/react-table";
import { ObjectId } from "mongoose";
import { z } from "zod";

export type Payment = {
    _id: ObjectId
    name: string;
    surname: string;
    tel: string;
    email: string;
    service: string;
    data: string;
    time: string;
};

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data?: TData[];
}

export const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().nonempty("Name is required"),
    mobile: z.string().nonempty("Mobile is required"),
    amount: z.string().nonempty("Amount is required"),
    status: z.enum(["pending", "processing", "success", "failed"]),
});

export type FormValues = z.infer<typeof formSchema>;

export type UserFormProps = {
    onSuccess?: () => void;
    payment?: Payment;
};