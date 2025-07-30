import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings, AlertTriangle, Play, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApifySchema } from '@/hooks/useApify';
import type { ApifySchema, ExecutionMode } from '@/types/apify';

interface DynamicFormProps {
  token: string;
  actorId: string;
  actorName: string;
  onSubmit: (data: any, mode: ExecutionMode) => void;
  isSubmitting: boolean;
}

export const DynamicForm = ({ token, actorId, actorName, onSubmit, isSubmitting }: DynamicFormProps) => {
  const [mode, setMode] = useState<ExecutionMode>('OUTPUT');
  const { data: schemaData, isLoading, error } = useApifySchema(token, actorId);
  const form = useForm();

  useEffect(() => {
    if (schemaData?.schema?.properties) {
      const defaultValues: any = {};
      Object.entries(schemaData.schema.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.default !== undefined) {
          defaultValues[key] = prop.default;
        } else if (prop.type === 'boolean') {
          defaultValues[key] = false;
        } else if (prop.type === 'array') {
          defaultValues[key] = [];
        } else if (prop.type === 'object') {
          defaultValues[key] = {};
        }
      });
      form.reset(defaultValues);
    }
  }, [schemaData, form]);

  const handleSubmit = (data: any) => {
    // Clean up data - remove empty strings and null values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onSubmit(cleanData, mode);
  };

  const renderField = (name: string, property: any, isRequired: boolean) => {
    const { type, title, description, enum: enumValues, items } = property;

    if (enumValues && Array.isArray(enumValues)) {
      return (
        <FormField
          key={name}
          control={form.control}
          name={name}
          rules={{ required: isRequired ? `${title || name} is required` : false }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {title || name}
                {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${title || name}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enumValues.map((option: any) => (
                    <SelectItem key={String(option)} value={String(option)}>
                      {String(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (type === 'boolean') {
      return (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2">
                  {title || name}
                  {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
                </FormLabel>
                {description && <FormDescription>{description}</FormDescription>}
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      );
    }

    if (type === 'integer' || type === 'number') {
      return (
        <FormField
          key={name}
          control={form.control}
          name={name}
          rules={{ 
            required: isRequired ? `${title || name} is required` : false
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {title || name}
                {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={description || `Enter ${title || name}`}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : Number(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (type === 'array') {
      return (
        <FormField
          key={name}
          control={form.control}
          name={name}
          rules={{ required: isRequired ? `${title || name} is required` : false }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {title || name}
                {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Enter ${title || name} (one item per line)`}
                  value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                    field.onChange(lines);
                  }}
                />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (type === 'object') {
      return (
        <FormField
          key={name}
          control={form.control}
          name={name}
          rules={{ 
            required: isRequired ? `${title || name} is required` : false,
            validate: (value) => {
              if (!value) return true;
              try {
                JSON.parse(value);
                return true;
              } catch {
                return 'Must be valid JSON';
              }
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {title || name}
                {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Enter ${title || name} as JSON`}
                  value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    // Default to string/text
    const isLongText = description && description.length > 100;
    
    return (
      <FormField
        key={name}
        control={form.control}
        name={name}
        rules={{ required: isRequired ? `${title || name} is required` : false }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {title || name}
              {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </FormLabel>
            <FormControl>
              {isLongText ? (
                <Textarea
                  placeholder={description || `Enter ${title || name}`}
                  {...field}
                />
              ) : (
                <Input
                  placeholder={description || `Enter ${title || name}`}
                  {...field}
                />
              )}
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Loading Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
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
            Error Loading Schema
          </CardTitle>
          <CardDescription>
            {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const schema = schemaData?.schema;
  const properties = schema?.properties || {};
  const required = schema?.required || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configure {actorName}
        </CardTitle>
        <CardDescription>
          {schema?.description || 'Configure the input parameters for this actor.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Execution Mode Selector */}
            <div className="space-y-3">
              <Label>Execution Mode</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === 'OUTPUT' ? 'default' : 'outline'}
                  onClick={() => setMode('OUTPUT')}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  OUTPUT
                </Button>
                <Button
                  type="button"
                  variant={mode === 'DATASET' ? 'default' : 'outline'}
                  onClick={() => setMode('DATASET')}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  DATASET
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {mode === 'OUTPUT' 
                  ? 'Get the actor\'s direct output from the OUTPUT record'
                  : 'Get the structured dataset items created by the actor'
                }
              </p>
            </div>

            {/* Dynamic Fields */}
            {Object.keys(properties).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(properties).map(([name, property]: [string, any]) => {
                  const isRequired = required.includes(name);
                  return renderField(name, property, isRequired);
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                This actor doesn't require any input parameters.
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Running Actor...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Actor
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};