import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * Accessible search bar for filtering games
 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextField
      label="Search games"
      variant="outlined"
      value={value}
      onChange={e => onChange(e.target.value)}
      fullWidth
      size="medium"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        inputProps: {
          'aria-label': 'Search games',
        }
      }}
      sx={{ background: '#fff' }}
    />
  );
} 