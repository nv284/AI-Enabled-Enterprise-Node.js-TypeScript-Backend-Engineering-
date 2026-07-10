
type User = {
  id: number;
  name: string;
  email: string;
};

async function fetchUsers() {
  const res = await fetch("https://api.example.com/users");
  const data: any = await res.json();
  return data as User[];
}

async function fetchWithRetry(url: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      return response.json();
    } catch (error) {
      if (i === retries) {
        throw error;
      }
    }
  }
}

async function bulkFetch(urls: string[]) {
  const results: any[] = [];

  for (const url of urls) {
    results.push(await fetchWithRetry(url));
  }

  return results;
}