"use server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { sendWelcomeEmail, generateTempPassword, sendWelcomeSMS } from "@/lib/services/emailService";

export async function resetUserPassword(userId: string, email: string) {
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

    // Get user's role and phone number
    const { data: userData } = await supabase
        .from('users')
        .select('phone, role')
        .eq('id', userId)
        .single();

    let newPassword: string;
    
    // For drivers, use fixed password
    if (userData?.role === 'driver') {
        const { data: driverData } = await supabase
            .from('drivers')
            .select('cell_number')
            .eq('user_id', userId)
            .single();
        
        newPassword = 'EPS83782';
        
        // Update user password to driver_code
        const { error } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Send SMS to driver's phone with driver_code as password
        const smsResult = await sendWelcomeSMS({
            phone: driverData.cell_number || userData.phone,
            password: newPassword,
            role: "Driver",
            company: "EPS Courier Services"
        });

        return { 
            success: true, 
            emailSent: false,
            smsSent: smsResult.success
        };
    } else {
        // For non-drivers, generate random password
        newPassword = generateTempPassword(8);
        
        // Update user password
        const { error } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Send email with new password
        const emailResult = await sendWelcomeEmail({
            email,
            phone: userData?.phone,
            password: newPassword,
            role: "User",
            company: "EPS Courier Services"
        });

        return { 
            success: true, 
            emailSent: emailResult.success,
            smsSent: emailResult.smsResult?.success || false
        };
    }
}