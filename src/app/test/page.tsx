export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Frontend is Working!
        </h1>
        <p className="text-gray-600 mt-2">
          If you can see this, the frontend is running correctly.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Backend API URL:{" "}
          {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
        </p>
      </div>
    </div>
  );
}
