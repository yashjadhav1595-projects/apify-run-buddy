import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertTriangle } from 'lucide-react';
import { useApifyActors } from '@/hooks/useApify';
import type { ApifyActor } from '@/types/apify';

interface ActorSelectorProps {
  token: string;
  selectedActor?: ApifyActor;
  onActorSelect: (actor: ApifyActor) => void;
}

export const ActorSelector = ({ token, selectedActor, onActorSelect }: ActorSelectorProps) => {
  const { data: actors, isLoading, error } = useApifyActors(token);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Select Actor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Actors
          </CardTitle>
          <CardDescription>
            {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!actors || actors.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            No Actors Found
          </CardTitle>
          <CardDescription>
            You don't have any actors in your Apify account yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Select Actor
        </CardTitle>
        <CardDescription>
          Choose an actor to run from your {actors.length} available actors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedActor?.id || ''}
          onValueChange={(value) => {
            const actor = actors.find(a => a.id === value);
            if (actor) onActorSelect(actor);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an actor to run" />
          </SelectTrigger>
          <SelectContent>
            {actors.map((actor) => (
              <SelectItem key={actor.id} value={actor.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{actor.title || actor.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {actor.username}/{actor.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};