import { requireSession } from "@/lib/auth";

export default async function DebugSessionPage() {
  const session = await requireSession();

  return (
    <pre className="p-8 text-white bg-black min-h-screen">
      {JSON.stringify(session, null, 2)}
    </pre>
  );
}