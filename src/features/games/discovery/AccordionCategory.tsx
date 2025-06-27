import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Card, CardActionArea, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { Game, SUBJECTS } from '@/utils/gameData';
import { useEnhancedTheme } from '@/stores/hooks';

/**
 * Accessible accordion for a subject with its games
 * @param {string} subject - The subject name
 * @param {Game[]} games - Array of games for this subject
 * @param {boolean} expanded - Whether the accordion is expanded
 * @param {() => void} onChange - Callback for toggling expansion
 */
export default function AccordionCategory({ 
  subject, 
  games, 
  expanded, 
  onChange 
}: {
  subject: keyof typeof SUBJECTS;
  games: Game[];
  expanded: boolean;
  onChange: () => void;
}) {
  const { themeConfig } = useEnhancedTheme();
  const subjectConfig = SUBJECTS[subject];

  return (
    <Accordion expanded={expanded} onChange={onChange} sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${subject.toLowerCase().replace(/\s+/g, '-')}-content`}
        id={`${subject.toLowerCase().replace(/\s+/g, '-')}-header`}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <span style={{ fontSize: 32 }} aria-hidden="true">{subjectConfig.icon}</span>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: themeConfig.primary }}>
              {subject}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {games.length} game{games.length !== 1 ? 's' : ''} available
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {games.map((game: Game) => (
            <Card 
              key={game.id} 
              sx={{ 
                minWidth: 220, 
                flex: '1 1 220px', 
                background: `linear-gradient(135deg, ${subjectConfig.color}ee, ${subjectConfig.color}cc)`,
                color: '#fff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${subjectConfig.color}40`
                }
              }}
            >
              <Link href={game.href} passHref legacyBehavior>
                <CardActionArea component="a" aria-label={game.title}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <span style={{ fontSize: 24 }} aria-hidden="true">{game.emoji}</span>
                      <Typography variant="subtitle1" component="div" fontWeight={700}>
                        {game.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      {game.description}
                    </Typography>
                    
                    {/* Game metadata */}
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          padding: '2px 6px',
                          borderRadius: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        Ages {game.ageRange[0]}-{game.ageRange[1]}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          padding: '2px 6px',
                          borderRadius: 1,
                          fontSize: '0.7rem'
                        }}
                      >
                        {game.estimatedDuration} min
                      </Typography>
                      {game.skillLevel === 'intermediate' && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}
                        >
                          Challenge
                        </Typography>
                      )}
                    </Box>
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