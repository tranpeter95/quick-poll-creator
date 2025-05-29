import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import { findPoll, validatePoll } from "./pollMiddleware.js";
import { readPolls, writePolls } from "./pollData.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Create poll
app.post("/api/polls", validatePoll, (req, res) => {
  const { question, options } = req.body;

  const newPoll = {
    id: uuidv4(),
    question,
    options: options.map((text) => ({ id: uuidv4(), text, votes: 0 })),
  };

  const polls = readPolls();
  polls.push(newPoll);
  writePolls(polls);

  res.status(201).json(newPoll);
});

// Get all polls
app.get("/api/polls", (_req, res) => {
  const polls = readPolls();
  res.json(polls);
});

// Get poll by ID
app.get("/api/polls/:pollId", findPoll, (req, res) => {
  res.json(req.poll);
});

// Vote on poll
app.post("/api/polls/:pollId/vote", findPoll, (req, res) => {
  const { optionId } = req.body;
  const { poll, polls, pollIndex } = req;

  const option = poll.options.find((option) => option.id === optionId);
  if (!option) return res.status(404).json({ error: "Option not found." });

  option.votes += 1;
  polls[pollIndex] = poll;
  writePolls(polls);

  res.json(poll);
});

// Edit poll
app.put("/api/polls/:pollId", findPoll, validatePoll, (req, res) => {
  const { poll, polls, pollIndex } = req;
  const { question, options } = req.body;

  poll.question = question;

  poll.options = options.map((option) => ({
    id: option.id && !option.id.startsWith("temp-") ? option.id : uuidv4(),
    text: option.text,
    votes: typeof option.votes === "number" ? option.votes : 0,
  }));

  polls[pollIndex] = poll;
  writePolls(polls);

  res.json(poll);
});

// Delete poll
app.delete("/api/polls/:pollId", findPoll, (req, res) => {
  const { polls, pollIndex } = req;

  polls.splice(pollIndex, 1);
  writePolls(polls);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
