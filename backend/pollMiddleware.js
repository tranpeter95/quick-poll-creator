import { readPolls } from "./pollData.js";

export function findPoll(req, res, next) {
  const { pollId } = req.params;
  const polls = readPolls();

  const pollIndex = polls.findIndex((poll) => poll.id === pollId);
  if (pollIndex === -1) {
    return res.status(404).json({ error: "Poll not found." });
  }

  req.polls = polls;
  req.poll = polls[pollIndex];
  req.pollIndex = pollIndex;

  next();
}

export function validatePoll(req, res, next) {
  const { question, options } = req.body;

  if (!question || typeof question !== "string") {
    return res
      .status(400)
      .json({ error: "Question is required and must be a string." });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ error: "At least two options are required." });
  }

  next();
}
