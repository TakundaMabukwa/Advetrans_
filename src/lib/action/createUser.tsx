"use server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { sendWelcomeEmail, generateTempPassword } from "@/lib/services/emailService";
import { createClient } from "@/lib/supabase/server";

export async function CreateUser(formData: FormData) {
    try {
        console.log('CreateUser called with formData');
        const role = formData.get("role") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const driverCode = formData.get("driverCode") as string;
        
        console.log('Extracted values:', { role, email, phone, driverCode });
    
    // Validate role
    if (
        role !== "admin" &&
        role !== "fleet manager" &&
        role !== "fc" &&
        role !== "customer" &&
        role !== "driver"
    ) {
        console.log('Invalid role:', role);
        return { success: false, message: "Invalid role selected" };
    }

    // Generate password - use EPS83782 for drivers, temp password for others
    const tempPassword = role === 'driver' ? 'EPS83782' : generateTempPassword();
    console.log('Generated password for role', role, ':', tempPassword);

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

    // Create user using service role
    console.log('Creating auth user with email:', email);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            role,
        },
    });
    console.log('Auth user creation result:', { newUser: !!newUser, error: createError });

    if (createError) {
        console.error("Error creating user:", createError.message);
        console.error("Full error:", createError);
        return { success: false, message: createError.message };
    }

    const userId = newUser.user?.id;
    if (!userId) {
        return { success: false, message: "No user ID returned from authentication" };
    }

    // Get permissions from form data or use default
    const permissionsData = formData.get("permissions") as string;
    let permissions = permissionsData ? JSON.parse(permissionsData) : null;
    
    // Special case: admin@eps.com gets all permissions
    if (email === "admin@eps.com") {
        permissions = [
            { page: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'fleetJobs', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'loadPlan', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'fuel', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'drivers', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'vehicles', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'costCenters', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'financials', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'inspections', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'userManagement', actions: ['view', 'create', 'edit', 'delete'] },
            { page: 'systemSettings', actions: ['view', 'create', 'edit', 'delete'] }
        ];
    }

    // Insert into users table
    const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        phone,
        role,
        created_at: new Date().toISOString(),
        tech_admin: false,
        first_login: true,
        permissions: permissions,
        energyrite: false,
        cost_code: "",
        company: "EPS Courier Services"
    });

    if (insertError) {
        console.error("Error inserting user profile:", insertError.message);
        return { success: false, message: "Failed to create user profile: " + insertError.message };
    }

    // Handle driver creation
    if (role === 'driver') {
        const fullDriverCode = `EPS${driverCode}`;
        
        // Check if driver exists by email
        const { data: existingDriver } = await supabase
            .from('drivers')
            .select('id')
            .eq('email_address', email)
            .single();
            
        if (existingDriver) {
            // Update existing driver
            const { error: updateError } = await supabase
                .from('drivers')
                .update({
                    user_id: userId,
                    email_address: email,
                    cell_number: phone,
                    driver_code: fullDriverCode
                })
                .eq('email_address', email);
                
            if (updateError) {
                return { success: false, message: "Failed to update driver: " + updateError.message };
            }
        } else {
            // Insert new driver
            const { error: driverError } = await supabase
                .from('drivers')
                .insert({
                    user_id: userId,
                    first_name: email,
                    email_address: email,
                    cell_number: phone,
                    driver_code: fullDriverCode
                });
                
            if (driverError) {
                return { success: false, message: "Failed to create driver: " + driverError.message };
            }
        }
        
        // Send welcome SMS to driver
        const emailResult = await sendWelcomeEmail({
            email,
            phone,
            password: tempPassword,
            role: "Driver",
            company: "EPS Courier Services"
        });
        
        const emailStatus = emailResult.success ? 'Email sent' : 'Email failed';
        const smsStatus = emailResult.smsResult?.success ? 'SMS sent' : 'SMS failed';
        return { success: true, message: `Driver created successfully. ${emailStatus}, ${smsStatus}.` };
    }

    // Send welcome email and SMS for non-drivers
    const emailResult = await sendWelcomeEmail({
        email,
        phone,
        password: tempPassword,
        role,
        company: "EPS Courier Services",
        cost_code: "",
        site_id: ""
    });

    if (emailResult.success) {
        console.log("✅ User created successfully");
        if (emailResult.message?.includes('skipped')) {
            return { success: true, message: "User created successfully (email not configured)" };
        } else {
            const smsStatus = emailResult.smsResult?.success ? 'SMS sent' : 'SMS failed';
            return { success: true, message: `User created successfully. Email and ${smsStatus}.` };
        }
    } else {
        console.log("⚠️ User created but email failed:", emailResult.error);
        const smsStatus = emailResult.smsResult?.success ? 'SMS sent' : 'SMS failed';
        return { success: true, message: `User created successfully. Email failed, ${smsStatus}.` };
    }
    } catch (error: any) {
        console.error('Unhandled error in CreateUser:', error);
        return { success: false, message: 'Unexpected error: ' + error.message };
    }
}




export async function createWorkshopWithAdmin(formData: FormData) {
  const supabase = await createClient();

  const workshopName = formData.get("workshopName") as string;
  const location = formData.get("location") as string;

  const adminFirstName = formData.get("adminFirstName") as string;
  const adminLastName = formData.get("adminLastName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPhone = formData.get("adminPhone") as string;

  // ✅ 1. Insert workshop
  const { data: workshop, error: workshopError } = await supabase
    .from("workshop")
    .insert([
      {
        work_name: workshopName,
        location: location,
      }
    ])
    .select()
    .single();

  if (workshopError || !workshop) {
    console.error("Error creating workshop:", workshopError?.message);
    redirect("/register?message=Failed to create workshop");
  }

  // ✅ 2. Create admin user using service role
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPhone, // Using phone as password
    email_confirm: true,
    user_metadata: {
      firstName: adminFirstName,
      lastName: adminLastName,
      phone: adminPhone,
      role: "customer", // default role
    },
  });

  if (createError) {
    console.error("Error creating admin user:", createError.message);
    redirect("/register?message=Failed to create admin user");
  }

  const userId = newUser.user?.id;
  if (!userId) {
    redirect("/register?message=No user ID returned");
  }

  // ✅ 3. Insert into profiles linked to workshop
  const { error: profileError } = await supabase.from("users").insert({
    id: userId,
    full_name: `${adminFirstName} ${adminLastName}`,
    phone_number: adminPhone,
    email: adminEmail,
    role: "customer",
    workshop_id: workshop.id, // ✅ Link to workshop
  });

  if (profileError) {
    console.error("Error inserting profile:", profileError.message);
    redirect("/register?message=Failed to create profile");
  }

  console.log("Workshop created:", workshop.id, "Admin user:", userId);

  redirect(`/register/workshop/fileUpload?workshopId=${workshop.id}`);
}