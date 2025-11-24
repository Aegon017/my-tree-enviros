"use client";
import AddressForm from "@/components/address-form";

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Add New Address</h1>

      <AddressForm onSaved={() => (window.location.href = "/address")} />
    </div>
  );
}
