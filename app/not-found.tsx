export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="mt-2 text-muted-foreground">The page you are looking for doesnt exist or may have been moved.</p>
        <a href="/" className="mt-4 inline-block rounded-md bg-black text-white px-4 py-2 hover:bg-gray-800">Go back home</a>
      </div>
    </div>
  );
}