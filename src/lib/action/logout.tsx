"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function logout() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error(error)
    }
    // const cookieStore = await cookies()
    // cookieStore.delete('access_token')
    // cookieStore.delete('refresh_token')
    // cookieStore.delete('role')
}
