import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Accessible search bar for filtering games
 * @param {string} value - The current search value
 * @param {(val: string) => void} onChange - Callback for when the search value changes
 */
export default function SearchBar({ value, onChange }: { value: string, onChange: (val: string) => void }) {
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