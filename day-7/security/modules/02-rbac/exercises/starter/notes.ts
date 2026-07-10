// Starter for Ex 2 — a deliberately vulnerable notes route.
import express from 'express';

const app = express();
app.use(express.json());

type Note = { id: string; userId: string; title: string; body: string };
const notes: Note[] = [
  { id: '1', userId: 'ada', title: 'Ada shopping', body: 'milk, bread' },
  { id: '2', userId: 'bob', title: "Bob's secrets", body: 'redacted' },
];

// TODO: add authGuard, ownership check, and return 404 (not 403) for non-owned.
app.get('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'not found' });
  res.json(note); // ❌ BOLA
});

app.listen(3012, () => console.log('http://localhost:3012'));
