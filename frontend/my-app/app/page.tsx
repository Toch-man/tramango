import PackageList from "@/app/components/package_list";

// This stays a Server Component — it has no interactivity or hooks of
// its own, so there's no reason to ship it as client JS. It just
// renders the actual interactive list, which needs to be a Client
// Component since it uses RTK Query hooks (useGetPackagesQuery, etc.)
// and React state — both require the browser.
export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Travel Packages</h1>
      <PackageList />
    </main>
  );
}
