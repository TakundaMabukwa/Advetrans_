"use server"

import { createClient } from "@supabase/supabase-js"

export async function disableUser(userId: string) {
    try {
        const serviceSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Ban user in auth (876000 hours = ~100 years)
        const { error: banError } = await serviceSupabase.auth.admin.updateUserById(userId, {
            ban_duration: "876000h"
        });

        if (banError) {
            return { success: false, error: banError.message };
        }

        // Update users table
        const { error: updateError } = await serviceSupabase
            .from('users')
            .update({ is_active: false })
            .eq('id', userId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
