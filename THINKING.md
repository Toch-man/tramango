# THINKING.md

## Server vs Client Components (Next.js App Router)

I kept the split minimal and deliberate:

* **`app/page.tsx`** is a Server Component. It does not contain state, hooks, or interactive behavior. It renders the page and delegates the interactive package UI to a child component.
* **`components/package_list.tsx`** is a Client Component because it uses RTK Query hooks and handles button clicks for booking.
* **`redux-provider.tsx`** is also a Client Component because Redux's `Provider` relies on React context. Keeping this as a separate client component allows the rest of the layout to remain a Server Component.

The general approach was to keep components as Server Components unless they actually needed browser-side interactivity or client-side hooks.

## Caching and State Updates with RTK Query

I used RTK Query to handle communication with the backend and caching of package data.

The package query provides tags for the packages, while the booking mutation invalidates the affected package's cache.

I also used an optimistic update with `onQueryStarted`.

When the user clicks **Book Now**, the cached `availableSlots` value is immediately decreased by one. This makes the interface respond immediately instead of waiting for the booking request to finish.

The actual booking decision is still made by the backend. The frontend does not assume that the booking succeeded.

If the backend rejects the booking, the optimistic update is undone using `patchResult.undo()`. This allows the UI to return to the previous value.

This means the optimistic update improves the user experience, while the backend remains responsible for the actual availability check.

## Backend Structure

The backend uses Node.js, Express, and MongoDB with Mongoose.

I separated the backend into models, controllers, and routes:

* **`server.ts`** is responsible for starting the Express application, loading environment variables, configuring middleware, connecting to MongoDB, and registering the routes.
* **`src/models/package_model.ts`** contains the Mongoose schema for a travel package.
* **`src/controller/package_controller.ts`** contains the business logic for retrieving packages and booking a package.
* **`src/routes/package_route.ts`** defines the HTTP endpoints and connects them to the controller functions.

The API has two main endpoints:

```text
GET  /api/packages
POST /api/packages/:id/book
```

The package model contains:

```text
title
description
availableSlots
price
```

### Preventing Overbooking

The booking endpoint checks whether `availableSlots` is greater than zero before allowing a booking.

The frontend can optimistically reduce the displayed slot count, but this is not trusted by the backend.

The backend performs the real availability check and updates the MongoDB document. If there are no slots remaining, the server rejects the booking instead of allowing `availableSlots` to become negative.

This is important because multiple users could attempt to book the same package at nearly the same time.

## CORS Issue

During development, the frontend and backend were running on different origins:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

Because the browser treats these as different origins, the backend needs to allow requests from the frontend.

I configured Express CORS using the frontend URL from an environment variable:

```ts
cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
})
```

This allows the backend to accept requests from the local frontend while keeping the allowed origin configurable.

## Running the Project Locally

The frontend and backend are separate applications, so both need to be running during development.

### Backend

First, enter the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

The file should contain:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:3000
```

The MongoDB connection string should be replaced with the MongoDB database connection string available to the person running the project.

The `.env` file should not be committed to Git because it can contain private configuration or credentials.

Start the backend with:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

### Frontend

Open another terminal and enter the frontend directory:

```bash
cd frontend/my-app
npm install
```

Create a `.env.local` file inside the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

Open `http://localhost:3000` in a browser.

## Environment Variables

The project uses separate environment files because the frontend and backend require different configuration.

### Backend

```text
backend/.env
```

Contains:

```env
MONGODB_URI=...
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Frontend

```text
frontend/.env
```

Contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The actual environment files are not committed to the repository. The required variable names and setup instructions are documented here so another developer can create their own local environment.

## Development Flow

The basic request flow is:

```text
Browser
   ↓
Next.js frontend :3000
   ↓
RTK Query
   ↓
Express API :5000
   ↓
Package Controller
   ↓
Mongoose
   ↓
MongoDB
```

For a booking:

```text
User clicks Book Now
        ↓
RTK Query booking mutation
        ↓
POST /api/packages/:id/book
        ↓
Express route
        ↓
Booking controller
        ↓
Check availableSlots
        ↓
Update MongoDB
        ↓
Return success/failure
        ↓
RTK Query updates the client cache
        ↓
Updated slot count appears in the UI
```
