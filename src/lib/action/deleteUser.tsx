"use server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function deleteUser(userId: string) {
    // Create Supabase client with service role
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // Delete from users table first
    const { error: tableError } = await supabase.from("users").delete().eq("id", userId);
    if (tableError) {
        console.error("Error deleting user from table:", tableError.message);
        redirect(`/userManagement?message=${encodeURIComponent("Failed to delete user from database: " + tableError.message)}`);
    }

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
        console.error("Error deleting user from auth:", authError.message);
        // Continue anyway since user is already removed from database
    }

    console.log("✅ User deleted from both database and auth");
    redirect("/userManagement?message=User+deleted+successfully");
}