import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApifyUser, ApifyActor, ApifySchema, ApifyRunResult, ExecutionMode } from '@/types/apify';

export const useApifyToken = () => {
  const validateToken = useMutation({
    mutationFn: async (): Promise<ApifyUser> => {
      const { data, error } = await supabase.functions.invoke('validate-token');
      
      if (error) throw new Error(error.message);
      if (!data.valid) throw new Error(data.error || 'Invalid token');
      
      return data.user;
    }
  });

  return {
    validateToken,
    user: validateToken.data,
    isValidating: validateToken.isPending,
    validationError: validateToken.error?.message
  };
};

export const useApifyActors = () => {
  return useQuery({
    queryKey: ['apify-actors'],
    queryFn: async (): Promise<ApifyActor[]> => {
      const { data, error } = await supabase.functions.invoke('list-actors');
      
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data.actors;
    }
  });
};

export const useApifySchema = (actorId: string) => {
  return useQuery({
    queryKey: ['apify-schema', actorId],
    queryFn: async (): Promise<{ schema: ApifySchema; version: string }> => {
      const { data, error } = await supabase.functions.invoke('get-actor-schema', {
        body: { actorId }
      });
      
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    enabled: !!actorId
  });
};

export const useApifyRun = () => {
  return useMutation({
    mutationFn: async ({ 
      actorId, 
      input, 
      mode 
    }: { 
      actorId: string; 
      input: any; 
      mode: ExecutionMode; 
    }): Promise<ApifyRunResult> => {
      const { data, error } = await supabase.functions.invoke('run-actor', {
        body: { actorId, input, mode }
      });
      
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data;
    }
  });
};