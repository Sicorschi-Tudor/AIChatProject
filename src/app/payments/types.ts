import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

export type Payment = {
    id: string;
    amount: number;
    status: "pending" | "processing" | "success" | "failed";
    name: string;
    mobile: number;
};

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export const formSchema = z.object({
    id: z.string(),
    amount: z.string().nonempty("Amount is required"),
    name: z.string().nonempty("Name is required"),
    mobile: z
        .string()
        .regex(/^0\d{8}$/, "Mobile (MD) must be exactly 9 digits and start with 0"),
    status: z.enum(["pending", "processing", "success", "failed"]),
});

export type FormValues = z.infer<typeof formSchema>;

export type UserFormProps = {
    onSuccess?: () => void;
    payment?: Payment;
};