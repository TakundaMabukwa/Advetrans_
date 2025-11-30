"use server"

import { createClient } from "@supabase/supabase-js"

export async function enableUser(userId: string) {
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

        // Unban user in auth
        const { error: unbanError } = await serviceSupabase.auth.admin.updateUserById(userId, {
            ban_duration: "none"
        });

        if (unbanError) {
            return { success: false, error: unbanError.message };
        }

        // Update users table
        const { error: updateError } = await serviceSupabase
            .from('users')
            .update({ is_active: true })
            .eq('id', userId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
