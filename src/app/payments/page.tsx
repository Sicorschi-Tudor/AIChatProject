import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import PaymentForm from "./form";

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      name: "aexample.com",
      mobile: 60068006,
    },
    {
      id: "728ed52qwef",
      amount: 4100,
      status: "success",
      name: "c@example.com",
      mobile: 60068006,
    },
    {
      id: "728eqwed52f",
      amount: 2100,
      status: "failed",
      name: "b@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1100,
      status: "success",
      name: "x@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1030,
      status: "processing",
      name: "ba@example.com",
      mobile: 60068006,
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      name: "a@example.com",
      mobile: 60068006,
    },
    {
      id: "728ed52qwef",
      amount: 4100,
      status: "success",
      name: "c@example.com",
      mobile: 60068006,
    },
    {
      id: "728eqwed52f",
      amount: 2100,
      status: "failed",
      name: "b@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1100,
      status: "success",
      name: "x@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1030,
      status: "processing",
      name: "ba@example.com",
      mobile: 60068006,
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      name: "a@example.com",
      mobile: 60068006,
    },

    {
      id: "728ed52qwef",
      amount: 4100,
      status: "success",
      name: "c@example.com",
      mobile: 60068006,
    },
    {
      id: "728eqwed52f",
      amount: 2100,
      status: "failed",
      name: "b@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1100,
      status: "success",
      name: "x@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1030,
      status: "processing",
      name: "ba@example.com",
      mobile: 60068006,
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      name: "a@example.com",
      mobile: 60068006,
    },
    {
      id: "728ed52qwef",
      amount: 4100,
      status: "success",
      name: "c@example.com",
      mobile: 60068006,
    },
    {
      id: "728eqwed52f",
      amount: 2100,
      status: "failed",
      name: "b@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 1100,
      status: "success",
      name: "x@example.com",
      mobile: 60068006,
    },
    {
      id: "7qwe28ed52f",
      amount: 103000,
      status: "processing",
      name: "bbbbbbbba@example.com",
      mobile: 60068006,
    },
    // ...
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <PaymentForm />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
