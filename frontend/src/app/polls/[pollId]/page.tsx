import PollClient from "./poll-client.tsx";

export default async function PollPage({
  params,
}: {
  params: { pollId: string };
}) {
  const { pollId } = await params;
  const res = await fetch(`http://localhost:4000/api/polls/${pollId}`);

  if (!res.ok) {
    return <p className="p-6">Poll not found.</p>;
  }

  const poll = await res.json();

  return (
    <main className="max-w-xl mx-auto p-6">
      <PollClient poll={poll} />
    </main>
  );
}
