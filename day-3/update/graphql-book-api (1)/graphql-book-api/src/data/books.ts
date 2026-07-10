export type Genre =
  | "SELF_HELP"
  | "TECHNOLOGY"
  | "HISTORY"
  | "PRODUCTIVITY"
  | "FICTION";

export interface Book {
  id: string;
  title: string;
  price: number;
  authorId: string;
  genre: Genre;
  publishedYear: number;
  description: string;
  rating: number;
}

export const books: Book[] = [
  {
    id: "1",
    title: "Atomic Habits",
    price: 500,
    authorId: "1",
    genre: "SELF_HELP",
    publishedYear: 2018,
    description: "An easy and proven way to build good habits and break bad ones.",
    rating: 4.8
  },
  {
    id: "2",
    title: "Clean Code",
    price: 650,
    authorId: "2",
    genre: "TECHNOLOGY",
    publishedYear: 2008,
    description: "A handbook of agile software craftsmanship.",
    rating: 4.6
  },
  {
    id: "3",
    title: "Sapiens: A Brief History of Humankind",
    price: 720,
    authorId: "3",
    genre: "HISTORY",
    publishedYear: 2011,
    description: "Exploring how Homo sapiens came to dominate the planet.",
    rating: 4.7
  },
  {
    id: "4",
    title: "Deep Work",
    price: 550,
    authorId: "4",
    genre: "PRODUCTIVITY",
    publishedYear: 2016,
    description: "Rules for focused success in a distracted world.",
    rating: 4.6
  },
  {
    id: "5",
    title: "The Pragmatic Programmer",
    price: 800,
    authorId: "5",
    genre: "TECHNOLOGY",
    publishedYear: 1999,
    description: "Your journey to mastery in software development.",
    rating: 4.9
  },
  {
    id: "6",
    title: "The Clean Coder",
    price: 600,
    authorId: "2",
    genre: "TECHNOLOGY",
    publishedYear: 2011,
    description: "A code of conduct for professional programmers.",
    rating: 4.5
  }
];