import { Box, Typography, CircularProgress } from '@mui/material';

interface GeographyQuestionProps {
  question: string;
  outline: string;
  isLoading: boolean;
}

/**
 * Component for displaying a geography question with an SVG outline
 */
export default function GeographyQuestion({ question, outline, isLoading }: GeographyQuestionProps) {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      mb: 4
    }}>
      <Typography 
        variant="h4" 
        component="div" 
        align="center" 
        gutterBottom
      >
        {question}
      </Typography>
      
      <Box sx={{ 
        width: 200,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        '& svg': {
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }
      }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: outline }}
            style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        )}
      </Box>
    </Box>
  );
} 