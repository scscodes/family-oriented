"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Container, 
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Home() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleExpand = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        <Box>
          <ExpandableGameCard 
            title="Numbers" 
            description="Learn to count and recognize numbers"
            emoji="🔢"
            color="#4361ee"
            isExpanded={expandedSection === 'numbers'}
            onClick={() => toggleExpand('numbers')}
            subgames={[
              {
                title: "Number Recognition",
                description: "Learn to recognize numbers and count objects",
                href: "/games/numbers",
                emoji: "🔢",
                color: "#4361ee"
              },
              {
                title: "Number Words",
                description: "Match numbers with their word form",
                href: "/games/numbers/words",
                emoji: "📝",
                color: "#738dff"
              },
              {
                title: "Count by 2s",
                description: "Practice counting by twos",
                href: "/games/numbers/count-by/2",
                emoji: "2️⃣",
                color: "#0036bb"
              },
              {
                title: "Count by 5s",
                description: "Practice counting by fives",
                href: "/games/numbers/count-by/5",
                emoji: "5️⃣",
                color: "#5653c8"
              },
              {
                title: "Count by 10s",
                description: "Practice counting by tens",
                href: "/games/numbers/count-by/10",
                emoji: "🔟",
                color: "#6254cc"
              }
            ]}
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Letters" 
            description="Learn the alphabet and letter sounds"
            href="/games/letters"
            emoji="🔤"
            color="#ff6d00"
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Shapes" 
            description="Identify different shapes"
            href="/games/shapes"
            emoji="⭐"
            color="#2ec4b6"
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Colors" 
            description="Recognize and match colors"
            href="/games/colors"
            emoji="🌈"
            color="#ff5a5f"
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Patterns" 
            description="Find the patterns and sequences"
            href="/games/patterns"
            emoji="📊"
            color="#ffbe0b"
          />
        </Box>
        
        <Box>
          <ExpandableGameCard
            title="Math" 
            description="Practice simple math operations"
            emoji="➕"
            color="#9381ff"
            isExpanded={expandedSection === 'math'}
            onClick={() => toggleExpand('math')}
            subgames={[
              {
                title: "Addition",
                description: "Practice simple addition problems",
                href: "/games/math/addition",
                emoji: "➕",
                color: "#2ec4b6"
              },
              {
                title: "Subtraction",
                description: "Practice simple subtraction problems",
                href: "/games/math/subtraction",
                emoji: "➖",
                color: "#64f7e7"
              }
            ]}
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Fill in the Blank" 
            description="Complete the missing letters in words"
            href="/games/fill-in-the-blank"
            emoji="✏️"
            color="#ff9e40"
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Geography" 
            description="Learn about continents and US states"
            href="/games/geography"
            emoji="🌍"
            color="#64f7e7"
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Rhyming Words" 
            description="Pick the word that rhymes!" 
            href="/games/rhyming" 
            emoji="🧩" 
            color="#64f7e7" 
          />
        </Box>
        
        <Box>
          <GameCard 
            title="Shape Sorter" 
            description="Drag shapes into the correct holes" 
            href="/games/shapes/sorter" 
            emoji="🔷" 
            color="#2ec4b6" 
          />
        </Box>
      </Box>
    </Container>
  );
}

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  emoji: string;
  color: string;
}

function GameCard({ title, description, href, emoji, color }: GameCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '6px',
          background: color,
        },
        '&:hover': {
          transform: 'translateY(-6px)',
        }
      }}>
        <CardActionArea sx={{ height: '100%', pt: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h3" component="span" mr={2} sx={{ 
                fontSize: '2.5rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>
                {emoji}
              </Typography>
              <Typography variant="h5" component="h2" sx={{ 
                fontWeight: 600,
                color: color
              }}>
                {title}
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ opacity: 0.9 }}>
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
}

interface SubGameCardProps {
  title: string;
  description: string;
  href: string;
  emoji: string;
  color: string;
}

interface ExpandableGameCardProps {
  title: string;
  description: string;
  emoji: string;
  color: string;
  isExpanded: boolean;
  onClick: () => void;
  subgames: SubGameCardProps[];
}

function ExpandableGameCard({ 
  title, 
  description, 
  emoji, 
  color, 
  isExpanded,
  onClick,
  subgames 
}: ExpandableGameCardProps) {
  return (
    <Box sx={{ marginBottom: isExpanded ? 3 : 0 }}>
      <Card sx={{ 
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '6px',
          background: color,
        },
        '&:hover': {
          transform: isExpanded ? 'none' : 'translateY(-6px)',
        }
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardActionArea 
            sx={{ pt: 1, flexGrow: 1 }}
            onClick={onClick}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Typography variant="h3" component="span" mr={2} sx={{ 
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {emoji}
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ 
                    fontWeight: 600,
                    color
                  }}>
                    {title}
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48 }} /> {/* Placeholder for the IconButton space */}
              </Box>
              <Typography color="text.secondary" sx={{ opacity: 0.9, mt: 1 }}>
                {description}
              </Typography>
            </CardContent>
          </CardActionArea>
          
          {/* Move IconButton outside of CardActionArea */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              aria-label={isExpanded ? "collapse" : "expand"}
              sx={{ 
                color,
                transition: 'transform 0.3s',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
              size="medium"
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>
      
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box 
          sx={{ 
            mt: 2, 
            ml: 3, 
            borderLeft: `3px solid ${color}`,
            pl: 2
          }}
        >
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            {subgames.map((subgame, index) => (
              <Box key={index}>
                <Link href={subgame.href} style={{ textDecoration: 'none' }}>
                  <Card sx={{ 
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: subgame.color,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}>
                    <CardActionArea sx={{ py: 1 }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography variant="h5" component="span" mr={1.5} sx={{ 
                            fontSize: '1.8rem',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                          }}>
                            {subgame.emoji}
                          </Typography>
                          <Typography variant="h6" component="h3" sx={{ 
                            fontWeight: 600,
                            color: subgame.color
                          }}>
                            {subgame.title}
                          </Typography>
                        </Box>
                        <Typography 
                          color="text.secondary" 
                          variant="body2" 
                          sx={{ opacity: 0.9 }}
                        >
                          {subgame.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
