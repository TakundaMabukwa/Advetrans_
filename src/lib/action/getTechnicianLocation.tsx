// lib/getTechnicianLocation.ts
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

export const getTechnicianLocation = async (techId: number) => {
  const { data: location, error } = await (await supabase)
    .from('technicians')
    .select('location') // Only select the location field
    .eq('id', techId)
    .single();

  if (error || !location) throw error;

  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location.location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
  const data = await res.json();
  const [lng, lat] = data.features[0].center;

  return { lat, lng, name: location.location };
};
