"use server";
import { createClient } from "@/lib/supabase/server";

interface Technician {
    email: string;
}

export async function DeleteUser({ email }: Technician) {
    const supabase = await createClient();
    const { error: profileError } = await supabase.from("profiles").delete().eq("email", email);
    const { error: techError } = await supabase.from("technicians").update({
        isActive: false
    })
        .eq("email", email);

    if (profileError) {
        throw new Error(`Error deleting profile: ${profileError.message}`);
    }
    if (techError) {
        throw new Error(`Error deleting technician: ${techError.message}`);
    }

    return { message: "User deleted from profiles and technicians" };
}


export async function DeleteDriverUser({ email }: Technician) {
    const supabase = await createClient();
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", email);
    const { error: techError } = await supabase.from("technicians").delete().eq("email", email);

    if (profileError) {
        throw new Error(`Error deleting profile: ${profileError.message}`);
    }
    if (techError) {
        throw new Error(`Error deleting auth user: ${techError.message}`);
    }
    return { message: "User deleted successfully" };
}