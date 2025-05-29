"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Poll = {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
};

export default function PollClient({ poll }: { poll: Poll }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [pollState, setPollState] = useState(poll);
  const [isEditing, setIsEditing] = useState(false);

  const totalVotes = pollState.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const handleVote = async () => {
    if (!selectedOption) return;

    const res = await fetch(`http://localhost:4000/api/polls/${poll.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId: selectedOption }),
    });

    if (res.ok) {
      const updatedPoll = await res.json();
      setPollState(updatedPoll);
      setHasVoted(true);
    } else {
      alert("Failed to vote.");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`http://localhost:4000/api/polls/${poll.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Failed to delete poll.");
    }
  };

  const handleSave = async (updatedPoll: Poll) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/polls/${updatedPoll.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: updatedPoll.question,
            options: updatedPoll.options,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update poll");
      }

      const savedPoll = await res.json();
      setPollState(savedPoll);
      setIsEditing(false);
    } catch (error) {
      alert("Error saving poll. Please try again.");
      console.error(error);
    }
  };

  const addOption = () => {
    setPollState((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: `temp-${Date.now()}`,
          text: "",
          votes: 0,
        },
      ],
    }));
  };

  const deleteOption = (id: string) => {
    setPollState((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  };

  return (
    <Card>
      <CardHeader>
        {isEditing ? (
          <Input
            type="text"
            value={pollState.question}
            onChange={(e) =>
              setPollState((prev) => ({ ...prev, question: e.target.value }))
            }
          />
        ) : (
          <CardTitle>{pollState.question}</CardTitle>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            {pollState.options.map((option, i) => (
              <div key={option.id}>
                <Input
                  key={option.id}
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...pollState.options];
                    newOptions[i] = { ...option, text: e.target.value };
                    setPollState((prev) => ({ ...prev, options: newOptions }));
                  }}
                />
                <Button
                  onClick={() => deleteOption(option.id)}
                  disabled={pollState.options.length <= 2}
                  variant="destructive"
                  aria-label="Delete option"
                >
                  Delete Option
                </Button>
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={addOption}
                disabled={pollState.options.length >= 5}
              >
                Add Option
              </Button>
              <Button
                onClick={() => {
                  handleSave(pollState);
                  setIsEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          </>
        ) : !hasVoted ? (
          <>
            <RadioGroup onValueChange={setSelectedOption}>
              {pollState.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    className="cursor-pointer"
                    value={option.id}
                  />
                  <Label htmlFor={option.id}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>

            <Button onClick={handleVote} disabled={!selectedOption}>
              Submit Vote
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {pollState.options.map((option) => {
              const percent = totalVotes
                ? Math.round((option.votes / totalVotes) * 100)
                : 0;

              return (
                <div key={option.id}>
                  <div className="flex justify-between mb-1 text-sm font-medium">
                    <span>{option.text}</span>
                    <span>
                      {percent}% ({option.votes}{" "}
                      {option.votes === 1 ? "vote" : "votes"})
                    </span>
                  </div>
                  <Progress value={percent} />
                </div>
              );
            })}
            <p className="text-sm text-muted-foreground mt-2">
              Total votes: {totalVotes}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
