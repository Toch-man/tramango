import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Package {
  _id: string;
  title: string;
  description: string;
  availableSlots: number;
  price: number;
}

export const packages_api = createApi({
  reducerPath: "packages_api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  tagTypes: ["Package"],
  endpoints: (builder) => ({
    get_packages: builder.query<{ success: boolean; data: Package[] }, void>({
      query: () => "/api/packages",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((pkg) => ({
                type: "Package" as const,
                id: pkg._id,
              })),
              { type: "Package", id: "LIST" },
            ]
          : [{ type: "Package", id: "LIST" }],
    }),

    book_package: builder.mutation<{ success: boolean; data: Package }, string>(
      {
        query: (id) => ({
          url: `/api/packages/${id}/book`,
          method: "POST",
        }),
        // ── OPTIMISTIC UPDATE ──────────────────────────────────
        // instead of waiting for the server response and re-fetching the
        // whole list, we directly patch the cached package's availableSlots
        // down by 1 the moment the request fires — this is what makes the
        // UI update instantly, with no page refresh and no visible delay.
        // If the request fails, the patch is automatically rolled back.
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          const patch_result = dispatch(
            packages_api.util.updateQueryData(
              "get_packages",
              undefined,
              (draft) => {
                const pkg = draft.data.find((p) => p._id === id);
                if (pkg && pkg.availableSlots > 0) {
                  pkg.availableSlots -= 1;
                }
              },
            ),
          );

          try {
            await queryFulfilled;
          } catch {
            // server rejected the booking (e.g. slots hit 0 in a race) —
            // undo the optimistic change so the UI reflects reality again
            patch_result.undo();
          }
        },
        invalidatesTags: (result, error, id) => [{ type: "Package", id }],
      },
    ),
  }),
});

export const { useGet_packagesQuery, useBook_packageMutation } = packages_api;
