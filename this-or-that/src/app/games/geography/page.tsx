import Link from 'next/link';
import { Card, CardContent, Typography } from '@mui/material';

/**
 * Main geography page component that displays links to different geography quizzes
 */
export default function GeographyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Geography Quizzes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href="/games/geography/continents" passHref>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="text-center">
              <Typography variant="h5" component="h2" gutterBottom>
                Continents Quiz
              </Typography>
              <Typography color="textSecondary">
                Test your knowledge of world continents
              </Typography>
            </CardContent>
          </Card>
        </Link>
        <Link href="/games/geography/states" passHref>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="text-center">
              <Typography variant="h5" component="h2" gutterBottom>
                States Quiz
              </Typography>
              <Typography color="textSecondary">
                Identify US states from their outlines
              </Typography>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 