"use client";

import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Container, 
  Grid,
  Box
} from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          This or That
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Fun learning games for kids!
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <GameCard 
          title="Numbers" 
          description="Learn to count and recognize numbers"
          href="/games/numbers"
          emoji="🔢"
        />
        <GameCard 
          title="Letters" 
          description="Learn the alphabet and letter sounds"
          href="/games/letters"
          emoji="🔤"
        />
        <GameCard 
          title="Shapes" 
          description="Identify different shapes"
          href="/games/shapes"
          emoji="⭐"
        />
        <GameCard 
          title="Colors" 
          description="Recognize and match colors"
          href="/games/colors"
          emoji="🌈"
        />
        <GameCard 
          title="Patterns" 
          description="Find the patterns and sequences"
          href="/games/patterns"
          emoji="📊"
        />
        <GameCard 
          title="Math" 
          description="Practice simple addition and subtraction"
          href="/games/math"
          emoji="➕"
        />
      </Grid>
    </Container>
  );
}

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  emoji: string;
}

function GameCard({ title, description, href, emoji }: GameCardProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <Card sx={{ height: '100%' }}>
          <CardActionArea sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" component="span" mr={2}>
                  {emoji}
                </Typography>
                <Typography variant="h5" component="h2">
                  {title}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                {description}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Link>
    </Grid>
  );
}
