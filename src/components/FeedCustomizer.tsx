import { SlidersHorizontal, Sword, Compass, Laugh, Theater, Ghost, Rocket, Sparkles, Heart, Eye, Siren, Briefcase, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserPreferences } from '@/hooks/use-user-preferences';

interface FeedCustomizerProps {
  preferences: UserPreferences;
  onToggle: (key: keyof UserPreferences) => void;
}

export function FeedCustomizer({ preferences, onToggle }: FeedCustomizerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm border-white/10 hover:bg-white/10">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Personalize Feed</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Core Narrative Genres</SheetTitle>
          <SheetDescription>
            Customize your feed by enabling your favorite genres.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-6">
            
            <PreferenceItem 
              id="action" label="Action" icon={Sword} color="text-red-500"
              desc="High-energy, stunts, hero vs. villain"
              checked={preferences.action} onToggle={() => onToggle('action')} 
            />
            <PreferenceItem 
              id="adventure" label="Adventure" icon={Compass} color="text-amber-500"
              desc="Quests and journeys in exotic locales"
              checked={preferences.adventure} onToggle={() => onToggle('adventure')} 
            />
            <PreferenceItem 
              id="comedy" label="Comedy" icon={Laugh} color="text-yellow-500"
              desc="Lighthearted slapstick to dark satire"
              checked={preferences.comedy} onToggle={() => onToggle('comedy')} 
            />
            <PreferenceItem 
              id="drama" label="Drama" icon={Theater} color="text-emerald-500"
              desc="Realistic struggles and deep themes"
              checked={preferences.drama} onToggle={() => onToggle('drama')} 
            />
            <PreferenceItem 
              id="horror" label="Horror" icon={Ghost} color="text-purple-500"
              desc="Fear, dread, and supernatural forces"
              checked={preferences.horror} onToggle={() => onToggle('horror')} 
            />
            <PreferenceItem 
              id="scifi" label="Science Fiction" icon={Rocket} color="text-blue-500"
              desc="Futuristic tech and space travel"
              checked={preferences.scifi} onToggle={() => onToggle('scifi')} 
            />
            <PreferenceItem 
              id="fantasy" label="Fantasy" icon={Sparkles} color="text-indigo-400"
              desc="Magical elements and imaginary universes"
              checked={preferences.fantasy} onToggle={() => onToggle('fantasy')} 
            />
            <PreferenceItem 
              id="romance" label="Romance" icon={Heart} color="text-pink-500"
              desc="Love stories and relationships"
              checked={preferences.romance} onToggle={() => onToggle('romance')} 
            />
            <PreferenceItem 
              id="thriller" label="Thriller / Suspense" icon={Eye} color="text-zinc-400"
              desc="Tension, high stakes, and mysteries"
              checked={preferences.thriller} onToggle={() => onToggle('thriller')} 
            />
            <PreferenceItem 
              id="western" label="Western" icon={ShieldAlert} color="text-orange-700"
              desc="Cowboys, outlaws, and the frontier"
              checked={preferences.western} onToggle={() => onToggle('western')} 
            />
            <PreferenceItem 
              id="crime" label="Crime" icon={Briefcase} color="text-slate-500"
              desc="Criminals, detectives, and the law"
              checked={preferences.crime} onToggle={() => onToggle('crime')} 
            />
            <PreferenceItem 
              id="war" label="War" icon={Siren} color="text-stone-500"
              desc="Conflict, battle, and sacrifice"
              checked={preferences.war} onToggle={() => onToggle('war')} 
            />

          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper component
const PreferenceItem = ({ id, label, icon: Icon, color, desc, checked, onToggle }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full bg-secondary/50 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <Label htmlFor={`genre-${id}`} className="flex flex-col cursor-pointer">
        <span className="font-medium">{label}</span>
        <span className="text-xs font-normal text-muted-foreground line-clamp-1">{desc}</span>
      </Label>
    </div>
    <Switch id={`genre-${id}`} checked={checked} onCheckedChange={onToggle} />
  </div>
);
