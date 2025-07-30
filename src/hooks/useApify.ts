import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApifyUser, ApifyActor, ApifySchema, ApifyRunResult, ExecutionMode } from '@/types/apify';

export const useApifyToken = () => {
  const [token, setToken] = useState<string>('');
  
  const validateToken = useMutation({
    mutationFn: async (apiToken: string): Promise<ApifyUser> => {
      const { data, error } = await supabase.functions.invoke('validate-token', {
        body: { token: apiToken }
      });
      
      if (error) throw new Error(error.message);
      if (!data.valid) throw new Error(data.error || 'Invalid token');
      
      return data.user;
    },
    onSuccess: (user, apiToken) => {
      setToken(apiToken);
    }
  });

  const clearToken = () => {
    setToken('');
    validateToken.reset();
  };

  return {
    token,
    setToken,
    clearToken,
    validateToken,
    user: validateToken.data,
    isValidating: validateToken.isPending,
    validationError: validateToken.error?.message
  };
};

export const useApifyActors = (token: string) => {
  return useQuery({
    queryKey: ['apify-actors', token],
    queryFn: async (): Promise<ApifyActor[]> => {
      const { data, error } = await supabase.functions.invoke('list-actors', {
        body: { token }
      });
      
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data.actors;
    },
    enabled: !!token
  });
};

export const useApifySchema = (token: string, actorId: string) => {
  return useQuery({
    queryKey: ['apify-schema', token, actorId],
    queryFn: async (): Promise<{ schema: ApifySchema; version: string }> => {
      const { data, error } = await supabase.functions.invoke('get-actor-schema', {
        body: { token, actorId }
      });
      
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    enabled: !!token && !!actorId
  });
};

export const useApifyRun = () => {
  return useMutation({
    mutationFn: async ({ 
      token, 
      actorId, 
      input, 
      mode 
    }: { 
      token: string; 
      actorId: string; 
      input: any; 
      mode: ExecutionMode; 
    }): Promise<ApifyRunResult> => {
      const { data, error } = await supabase.functions.invoke('run-actor', {
        body: { token, actorId, input, mode }
      });
      
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data;
    }
  });
};