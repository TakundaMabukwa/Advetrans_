"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export function DatabaseMigration() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const runMigration = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.trips 
          ADD COLUMN IF NOT EXISTS pickup_time timestamp with time zone,
          ADD COLUMN IF NOT EXISTS dropoff_time timestamp with time zone;
        `
      });

      if (error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult('Migration completed successfully!');
      }
    } catch (err) {
      setResult(`Error: ${err.message || 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Migration</CardTitle>
        <CardDescription>Add pickup_time and dropoff_time columns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runMigration} disabled={loading}>
          {loading ? 'Running...' : 'Run Migration'}
        </Button>
        {result && <div className="text-sm">{result}</div>}
      </CardContent>
    </Card>
  );
}