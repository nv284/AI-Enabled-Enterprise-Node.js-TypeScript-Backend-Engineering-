export interface Author {
  id: string;
  name: string;
  bio: string;
  birthYear: number;
  country: string;
}

export const authors: Author[] = [
  {
    id: "1",
    name: "James Clear",
    bio: "Author focused on habits, decision making and continuous improvement.",
    birthYear: 1986,
    country: "USA"
  },
  {
    id: "2",
    name: "Robert C. Martin",
    bio: "Software engineer known as 'Uncle Bob' and author of Clean Code.",
    birthYear: 1952,
    country: "USA"
  },
  {
    id: "3",
    name: "Yuval Noah Harari",
    bio: "Historian and author of Sapiens and Homo Deus.",
    birthYear: 1976,
    country: "Israel"
  },
  {
    id: "4",
    name: "Cal Newport",
    bio: "Computer science professor and author on focus and productivity.",
    birthYear: 1982,
    country: "USA"
  },
  {
    id: "5",
    name: "Andrew Hunt",
    bio: "Co-author of The Pragmatic Programmer and founder of the Pragmatic Bookshelf.",
    birthYear: 1964,
    country: "USA"
  }
];