import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Poll = {
  id: string;
  question: string;
};

export default async function HomePage() {
  const res = await fetch("http://localhost:4000/api/polls");

  const polls: Poll[] = await res.json();

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All polls</h1>
        <Button asChild>
          <Link href="/create-poll">Create Poll</Link>
        </Button>
      </div>

      {polls.length === 0 ? (
        <p>No polls available.</p>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <Link key={poll.id} href={`/polls/${poll.id}`} className="block">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{poll.question}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
