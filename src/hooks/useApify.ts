import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApifyUser, ApifyActor, ApifySchema, ApifyRunResult, ExecutionMode } from '@/types/apify';

export const useApifyToken = () => {
  const [token, setToken] = useState<string>('');
  
  const validateToken = useMutation({
    mutationFn: async (apiToken: string): Promise<ApifyUser> => {
      console.log('🔍 Validating Apify token...');
      
      try {
        const { data, error } = await supabase.functions.invoke('validate-token', {
          body: { token: apiToken }
        });
        
        console.log('📡 Token validation response:', { 
          valid: data?.valid, 
          error: error || data?.error 
        });
        
        if (error) {
          console.error('❌ Supabase function error in token validation:', error);
          throw new Error(error.message);
        }
        
        if (!data.valid) {
          console.error('❌ Token validation failed:', data.error);
          throw new Error(data.error || 'Invalid token');
        }
        
        console.log('✅ Token validated successfully for user:', data.user.username);
        return data.user;
      } catch (err: any) {
        console.error('❌ Error in token validation:', err);
        throw err;
      }
    },
    onSuccess: (user, apiToken) => {
      console.log('✅ Token validation successful, storing token');
      setToken(apiToken);
    },
    onError: (error) => {
      console.error('❌ Token validation failed:', error);
    }
  });

  const clearToken = () => {
    console.log('🗑️ Clearing stored token');
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
      console.log('🔍 Fetching actors from backend...');
      
      try {
        const { data, error } = await supabase.functions.invoke('list-actors', {
          body: { token }
        });
        
        console.log('📡 List actors response:', { data, error });
        
        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(error.message);
        }
        
        if (data.error) {
          console.error('❌ API error from backend:', data.error);
          throw new Error(data.error);
        }
        
        console.log(`✅ Successfully fetched ${data.actors?.length || 0} actors`);
        return data.actors;
      } catch (err: any) {
        console.error('❌ Error in useApifyActors:', err);
        throw err;
      }
    },
    enabled: !!token,
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for actors fetch:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useApifySchema = (token: string, actorId: string) => {
  return useQuery({
    queryKey: ['apify-schema', token, actorId],
    queryFn: async (): Promise<{ schema: ApifySchema; version: string }> => {
      console.log(`🔍 Fetching schema for actor: ${actorId}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('get-actor-schema', {
          body: { token, actorId }
        });
        
        console.log('📡 Get schema response:', { data, error, actorId });
        
        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(error.message);
        }
        
        if (data.error) {
          console.error('❌ API error from backend:', data.error);
          throw new Error(data.error);
        }
        
        console.log(`✅ Successfully fetched schema for actor ${actorId}:`, {
          version: data.version,
          hasProperties: !!data.schema?.properties,
          propertyCount: data.schema?.properties ? Object.keys(data.schema.properties).length : 0
        });
        
        return data;
      } catch (err: any) {
        console.error('❌ Error in useApifySchema:', err);
        throw err;
      }
    },
    enabled: !!token && !!actorId,
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for schema fetch:`, error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
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
      console.log('🚀 Starting actor run:', {
        actorId,
        mode,
        inputKeys: Object.keys(input || {}),
        timestamp: new Date().toISOString()
      });
      
      try {
        const { data, error } = await supabase.functions.invoke('run-actor', {
          body: { token, actorId, input, mode }
        });
        
        console.log('📡 Run actor response:', { 
          data: data ? { 
            runId: data.run?.id, 
            status: data.run?.status, 
            hasResult: !!data.result,
            hasError: !!data.error 
          } : null, 
          error 
        });
        
        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(error.message);
        }
        
        if (data.error) {
          console.error('❌ API error from backend:', data.error);
          throw new Error(data.error);
        }
        
        console.log('✅ Actor run completed successfully:', {
          runId: data.run.id,
          status: data.run.status,
          duration: data.run.stats?.durationMillis,
          resultType: mode
        });
        
        return data;
      } catch (err: any) {
        console.error('❌ Error in useApifyRun:', err);
        throw err;
      }
    },
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for actor run:`, error);
      return failureCount < 2; // Less retries for runs
    },
    retryDelay: 2000
  });
};