"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Typography, 
  Container, 
  Box,
  IconButton,
  Chip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchBar from "@/components/SearchBar";
import AccordionCategory from "@/components/AccordionCategory";

// Academic subject definitions with colors
const SUBJECTS = {
  'Language Arts': { color: '#ff6d00', icon: '📚' },
  'Mathematics': { color: '#4361ee', icon: '🔢' },
  'Social Studies': { color: '#64f7e7', icon: '🌍' },
  'Visual Arts': { color: '#ff5a5f', icon: '🎨' }
};

// New: Centralized data for categories and subgames with subject categorization
const GAME_CATEGORIES = [
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

export default function Home() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Filter logic: filter categories and subgames by search term and subject
  const searchTerm = search.trim().toLowerCase();
  const filteredCategories = GAME_CATEGORIES
    .filter(category => !selectedSubject || category.subject === selectedSubject)
    .map(category => {
      // Filter subgames by search
      const filteredSubgames = category.subgames.filter(subgame =>
        subgame.title.toLowerCase().includes(searchTerm) ||
        subgame.description.toLowerCase().includes(searchTerm)
      );
      return { ...category, subgames: filteredSubgames };
    })
    .filter(category => category.subgames.length > 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        position: 'relative'
      }}>
        <Box sx={{ width: '100%' }}>
          <Box textAlign="center" mb={6} sx={{ 
            animation: 'fadeIn 0.8s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 700,
              background: 'linear-gradient(90deg, #4361ee, #ff6d00)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}>
              This or That
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}>
              Fun learning games for kids!
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
          <Link href="/settings" style={{ textDecoration: 'none' }}>
            <IconButton 
              aria-label="settings"
              sx={{ 
                color: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { 
                  color: 'rgba(0, 0, 0, 0.7)',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <SettingsIcon fontSize="large" />
            </IconButton>
          </Link>
        </Box>
      </Box>
      <SearchBar value={search} onChange={setSearch} />
      
      {/* Subject filter chips */}
      <Box mt={2} mb={2}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Filter by Subject:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Chip
            label="All Subjects"
            onClick={() => setSelectedSubject(null)}
            variant={selectedSubject === null ? "filled" : "outlined"}
            sx={{ 
              backgroundColor: selectedSubject === null ? '#e3f2fd' : 'transparent',
              '&:hover': { backgroundColor: selectedSubject === null ? '#bbdefb' : '#f5f5f5' }
            }}
          />
          {Object.entries(SUBJECTS).map(([subject, config]) => (
            <Chip
              key={subject}
              label={`${config.icon} ${subject}`}
              onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
              variant={selectedSubject === subject ? "filled" : "outlined"}
              sx={{ 
                backgroundColor: selectedSubject === subject ? config.color : 'transparent',
                color: selectedSubject === subject ? '#fff' : config.color,
                borderColor: config.color,
                '&:hover': { 
                  backgroundColor: selectedSubject === subject ? config.color : `${config.color}20`
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Box mt={4}>
        {filteredCategories.map(category => (
          <AccordionCategory
            key={category.key}
            category={category}
            expanded={expanded === category.key}
            onChange={() => setExpanded(expanded === category.key ? null : category.key)}
          />
        ))}
      </Box>
    </Container>
  );
}
