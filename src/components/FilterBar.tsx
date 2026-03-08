import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FilterValues {
  genre: string;
  year: string;
  rating: string;
  language: string;
  sortBy: string;
}

const EMPTY_FILTERS: FilterValues = {
  genre: '',
  year: '',
  rating: '',
  language: '',
  sortBy: 'popularity.desc',
};

interface FilterBarProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  type: 'movie' | 'tv';
}

const MOVIE_GENRES = [
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '14', name: 'Fantasy' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' },
];

const TV_GENRES = [
  { id: '10759', name: 'Action & Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '10762', name: 'Kids' },
  { id: '9648', name: 'Mystery' },
  { id: '10763', name: 'News' },
  { id: '10764', name: 'Reality' },
  { id: '10765', name: 'Sci-Fi & Fantasy' },
  { id: '10766', name: 'Soap' },
  { id: '10768', name: 'War & Politics' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
];

const TV_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'first_air_date.desc', label: 'Newest First' },
  { value: 'first_air_date.asc', label: 'Oldest First' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

const RATINGS = [
  { value: '9', label: '9+ Exceptional' },
  { value: '8', label: '8+ Great' },
  { value: '7', label: '7+ Good' },
  { value: '6', label: '6+ Decent' },
  { value: '5', label: '5+ Average' },
];

const FilterBar = ({ filters, onChange, type }: FilterBarProps) => {
  const genres = type === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const sortOptions = type === 'movie' ? SORT_OPTIONS : TV_SORT_OPTIONS;

  const hasActiveFilters = filters.genre || filters.year || filters.rating || filters.language || filters.sortBy !== 'popularity.desc';

  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => onChange({ ...EMPTY_FILTERS });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <Select value={filters.genre || '_all'} onValueChange={v => update('genre', v === '_all' ? '' : v)}>
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Genres</SelectItem>
          {genres.map(g => (
            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.year || '_all'} onValueChange={v => update('year', v === '_all' ? '' : v)}>
        <SelectTrigger className="w-[120px] h-9 text-xs">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <SelectItem value="_all">Any Year</SelectItem>
          {YEARS.map(y => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.rating || '_all'} onValueChange={v => update('rating', v === '_all' ? '' : v)}>
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Any Rating</SelectItem>
          {RATINGS.map(r => (
            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.language || '_all'} onValueChange={v => update('language', v === '_all' ? '' : v)}>
        <SelectTrigger className="w-[130px] h-9 text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Any Language</SelectItem>
          {LANGUAGES.map(l => (
            <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.sortBy} onValueChange={v => update('sortBy', v)}>
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1">
          <X className="w-3 h-3" />
          Clear
        </Button>
      )}
    </div>
  );
};

export { EMPTY_FILTERS };
export default FilterBar;
