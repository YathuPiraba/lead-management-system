export default function InvalidSubdomain() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-red-600">Invalid Subdomain</h1>
      <p className="mt-2 text-gray-600">
        The organization you&apos;re trying to access does not exist.
      </p>
    </div>
  );
}
