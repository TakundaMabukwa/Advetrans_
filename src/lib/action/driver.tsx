"use server"

import { createClient } from "@/lib/supabase/server"

interface Driver {
    first_name: string,
    surname: string,
    id_or_passport_number: string,
    id_or_passport_document: string,
    email_address: string,
    cell_number: string,
    sa_issued: boolean,
    work_permit_upload: string,
    license_number: string,
    license_expiry_date: string,
    license_code: string,
    driver_restriction_code: string,
    vehicle_restriction_code: string,
    front_of_driver_pic: string,
    rear_of_driver_pic: string,
    professional_driving_permit: boolean,
    pdp_expiry_date: string,
    created_by: string
}

export async function createDriver(driver: Driver) {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser()

    const user_id = user.user?.id;
    const { data: driverData, error: driverError } = await supabase.auth.signUp({

        email: driver.email_address,
        password: driver.cell_number,
        options: {
            data: {
                first_name: driver.first_name,
                surname: driver.surname,
                role: 'driver',
            }
        }
    })

    if (driverError) {
        console.error('Error creating driver:', driverError);
        return { error: driverError.message };
    }


    const { data, error } = await supabase.from('users')
        .upsert({
            // @ts-expect-error
            id: user_id, // <-- required!
            full_name: driver.first_name + ' ' + driver.surname,
            role: 'driver',
            email: driver.email_address,
            phone_number: driver.cell_number,
        })
        .select();

    if (error) {
        console.error('Error creating driver:', error);
        return { error: error.message };
    }

    return { data, error };
}

export async function addDriversToTable(driver: Driver) {
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase.auth.getUser()
    const user_id = user.user?.id;

    const { data, error } = await supabase.from('drivers')
        .insert([
            {
                ...driver,
                created_by: user_id,
                created_at: new Date().toISOString()
            }
        ])
    if (error) {
        console.error('Error adding driver to table:', error);
        return { error: error.message };
    }
    return { data, error };
}