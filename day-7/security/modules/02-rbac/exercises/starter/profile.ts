// Starter for Ex 3 — mass assignment vulnerability.
import express from 'express';

const app = express();
app.use(express.json());

type User = { id: string; name: string; email: string; role: 'user' | 'admin' };
const me: User = { id: 'ada', name: 'Ada', email: 'ada@x.com', role: 'user' };

// TODO: replace Object.assign with a strict schema whitelist.
app.patch('/me', (req, res) => {
  Object.assign(me, req.body);
  res.json(me);
});

app.listen(3013, () => console.log('http://localhost:3013'));
