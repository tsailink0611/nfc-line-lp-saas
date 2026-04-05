export function ErrorAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
      {message}
    </div>
  );
}

export function SuccessAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
      {message}
    </div>
  );
}
