"use client";

import {
  useGet_packagesQuery,
  useBook_packageMutation,
} from "@/app/lib/package_api";

export default function PackageList() {
  const { data, isLoading, isError } = useGet_packagesQuery();
  const [book_package, { isLoading: booking }] = useBook_packageMutation();

  const handle_book = async (id: string) => {
    try {
      await book_package(id).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Booking failed — no slots available.");
    }
  };

  if (isLoading) return <div>Loading packages...</div>;
  if (isError) return <div>Something went wrong loading packages.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data?.data.map((pkg: any) => (
        <div
          key={pkg._id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{pkg.title}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {pkg.description}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              ${pkg.price} · {pkg.availableSlots} slot
              {pkg.availableSlots !== 1 ? "s" : ""} left
            </div>
          </div>
          <button
            onClick={() => handle_book(pkg._id)}
            disabled={pkg.availableSlots === 0 || booking}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: pkg.availableSlots === 0 ? "#e5e7eb" : "#1B2B6B",
              color: pkg.availableSlots === 0 ? "#9ca3af" : "#fff",
              cursor: pkg.availableSlots === 0 ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            {pkg.availableSlots === 0 ? "Sold out" : "Book Now"}
          </button>
        </div>
      ))}
    </div>
  );
}
