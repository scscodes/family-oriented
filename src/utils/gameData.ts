// Academic subject definitions with colors
export const SUBJECTS = {
  'Language Arts': { color: '#ff6d00', icon: '📚' },
  'Mathematics': { color: '#4361ee', icon: '🔢' },
  'Social Studies': { color: '#64f7e7', icon: '🌍' },
  'Visual Arts': { color: '#ff5a5f', icon: '🎨' }
};

// Game data interface definitions
export interface GameData {
  title: string;
  description: string;
  href: string;
  emoji: string;
  color: string;
}

export interface CategoryData {
  key: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  subject: string;
  subgames: GameData[];
}

// Centralized data for categories and subgames with subject categorization
export const GAME_CATEGORIES: CategoryData[] = [
  {
    key: "numbers",
    title: "Numbers",
    description: "Learn to count and recognize numbers",
    emoji: "🔢",
    color: "#4361ee",
    subject: "Mathematics",
    subgames: [
      { title: "Numbers", description: "Learn to recognize numbers and count objects", href: "/games/numbers", emoji: "🔢", color: "#4361ee" }
    ]
  },
  {
    key: "letters",
    title: "Letters",
    description: "Learn the alphabet and letter sounds",
    emoji: "🔤",
    color: "#ff6d00",
    subject: "Language Arts",
    subgames: [
      { title: "Letters", description: "Learn the alphabet and letter sounds", href: "/games/letters", emoji: "🔤", color: "#ff6d00" }
    ]
  },
  {
    key: "shapes",
    title: "Shapes",
    description: "Identify different shapes",
    emoji: "⭐",
    color: "#2ec4b6",
    subject: "Visual Arts",
    subgames: [
      { title: "Shapes", description: "Identify different shapes", href: "/games/shapes", emoji: "⭐", color: "#2ec4b6" },
      { title: "Shape Sorter", description: "Drag shapes into the correct holes", href: "/games/shapes/sorter", emoji: "🔷", color: "#2ec4b6" }
    ]
  },
  {
    key: "colors",
    title: "Colors",
    description: "Recognize and match colors",
    emoji: "🌈",
    color: "#ff5a5f",
    subject: "Visual Arts",
    subgames: [
      { title: "Colors", description: "Recognize and match colors", href: "/games/colors", emoji: "🌈", color: "#ff5a5f" }
    ]
  },
  {
    key: "patterns",
    title: "Patterns",
    description: "Find the patterns and sequences",
    emoji: "📊",
    color: "#ffbe0b",
    subject: "Visual Arts",
    subgames: [
      { title: "Patterns", description: "Find the patterns and sequences", href: "/games/patterns", emoji: "📊", color: "#ffbe0b" }
    ]
  },
  {
    key: "math",
    title: "Math",
    description: "Practice simple math operations",
    emoji: "➕",
    color: "#9381ff",
    subject: "Mathematics",
    subgames: [
      { title: "Addition", description: "Practice simple addition problems", href: "/games/math/addition", emoji: "➕", color: "#2ec4b6" },
      { title: "Subtraction", description: "Practice simple subtraction problems", href: "/games/math/subtraction", emoji: "➖", color: "#ffbe0b" }
    ]
  },
  {
    key: "fill-in-the-blank",
    title: "Fill in the Blank",
    description: "Complete the missing letters in words",
    emoji: "✏️",
    color: "#ff9e40",
    subject: "Language Arts",
    subgames: [
      { title: "Fill in the Blank", description: "Complete the missing letters in words", href: "/games/fill-in-the-blank", emoji: "✏️", color: "#ff9e40" }
    ]
  },
  {
    key: "geography",
    title: "Geography",
    description: "Learn about continents and US states",
    emoji: "🌍",
    color: "#64f7e7",
    subject: "Social Studies",
    subgames: [
      { title: "Geography", description: "Learn about continents and US states", href: "/games/geography", emoji: "🌍", color: "#64f7e7" }
    ]
  },
  {
    key: "rhyming",
    title: "Rhyming Words",
    description: "Pick the word that rhymes!",
    emoji: "🧩",
    color: "#64f7e7",
    subject: "Language Arts",
    subgames: [
      { title: "Rhyming Words", description: "Pick the word that rhymes!", href: "/games/rhyming", emoji: "🧩", color: "#64f7e7" }
    ]
  }
]; 