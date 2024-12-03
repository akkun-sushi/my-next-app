import Dexie, { type EntityTable } from "dexie";

interface Search {
  id: number;
  language: string;
  difficulty: string;
  category: string;
}

const db = new Dexie("SearchDatabase") as Dexie & {
  Search: EntityTable<
    Search,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  Search: "++id, language, difficulty, category", // primary key "id" (for the runtime!)
});

export type { Search };
export { db };
