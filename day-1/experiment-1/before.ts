// before.ts
// Naive fetcher with 'any' and duplicated logic

type User = { id: number; name: string; email: string };

async function fetchUsers() {
    const res = await fetch('https://api.example.com/users');
    const data: any = await res.json();
    // lots of casts
    return data as User[];
}

async function fetchWithRetry(url: string, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const r = await fetch(url);
            return r.json();
        } catch (e) {
            if (i === retries) throw e;
        }
    }
}

async function bulkFetch(urls: string[]) {
    const results: any[] = [];
    for (const u of urls) {
        results.push(await fetchWithRetry(u));
    }
    return results;
}