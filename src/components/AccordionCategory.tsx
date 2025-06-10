import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Card, CardActionArea, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';

interface GameData {
  title: string;
  description: string;
  href: string;
  emoji: string;
  color: string;
}

interface CategoryData {
  key: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  subject: string;
  subgames: GameData[];
}

/**
 * Accessible accordion for a game category
 * @param {CategoryData} category - The category object (title, emoji, color, subgames)
 * @param {boolean} expanded - Whether the accordion is expanded
 * @param {() => void} onChange - Callback for toggling expansion
 */
export default function AccordionCategory({ category, expanded, onChange }: {
  category: CategoryData,
  expanded: boolean,
  onChange: () => void
}) {
  return (
    <Accordion expanded={expanded} onChange={onChange} sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${category.key}-content`}
        id={`${category.key}-header`}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <span style={{ fontSize: 32 }} aria-hidden="true">{category.emoji}</span>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: category.color }}>
            {category.title}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {category.subgames.map((game: GameData) => (
            <Card key={game.href} sx={{ minWidth: 220, flex: '1 1 220px', background: game.color, color: '#fff' }}>
              <Link href={game.href} passHref legacyBehavior>
                <CardActionArea component="a" aria-label={game.title}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <span style={{ fontSize: 24 }} aria-hidden="true">{game.emoji}</span>
                      <Typography variant="subtitle1" component="div" fontWeight={700}>{game.title}</Typography>
                    </Box>
                    <Typography variant="body2">{game.description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Link>
            </Card>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
} 