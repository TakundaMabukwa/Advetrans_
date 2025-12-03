const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

const drivers = [
  { id: 159, first_name: "Sandile Desmond", surname: "Mchunu", email_address: "survivalsandile@gmail.com", cell_number: "0720945807", driver_code: "EPS44521" },
  { id: 160, first_name: "Thabo Algrin", surname: "Sithole", email_address: "thabosithole734@gmail.com", cell_number: "0621426179", driver_code: "EPS51544" },
  { id: 161, first_name: "Sandile Sinenhlanhla", surname: "Zungu", email_address: "Sandilezungu344@gmail.com", cell_number: "0737930655", driver_code: "EPS53135" },
  { id: 162, first_name: "Sboniso", surname: "Ngcongo", email_address: "Ngcongosboniso490@gmail.com", cell_number: "0782060972", driver_code: "EPS23145" },
  { id: 163, first_name: "Senzo Wiseman", surname: "Ngcobo", email_address: "senzo.ngcobo@eps-driver.com", cell_number: "0646384337", driver_code: "EPS12121" },
  { id: 164, first_name: "Zakhele Enerst", surname: "Nkwanyana", email_address: "ernestnkwanyana51@gmail.co.za", cell_number: "0730089829", driver_code: "EPS54315" },
  { id: 165, first_name: "Velaphi Jagi Themba", surname: "Gazu", email_address: "thembogazu68@gmail.com", cell_number: "0660285007", driver_code: "EPS45414" },
  { id: 166, first_name: "Vincent Mzikawukhulelwa", surname: "Mhlambo", email_address: "vincentmhlambo68@gmail.com", cell_number: "0828479158", driver_code: "EPS43414" },
  { id: 168, first_name: "Thamsanqa Owen", surname: "Binase", email_address: "Thamiowen66@gmail.com", cell_number: "0622402675", driver_code: "EPS25121" },
  { id: 170, first_name: "Nhlanhla", surname: "Ngubo", email_address: "nhlanhla.ngubo@eps-driver.com", cell_number: "0712810794", driver_code: "EPS53123" },
  { id: 171, first_name: "Bhekabenguni Simon", surname: "Kweswa", email_address: "s2252419@gmail.com", cell_number: "0715721998", driver_code: "EPS41134" },
  { id: 172, first_name: "Thulani Sizwe", surname: "Gumede", email_address: "thulanisizwegumede@gmail.com", cell_number: "0783336939", driver_code: "EPS55214" },
  { id: 173, first_name: "Mmafu Johannes", surname: "Ngubeni", email_address: "Ngubenimj360@gmail.com", cell_number: "0720372160", driver_code: "EPS32521" },
  { id: 174, first_name: "Sicelimpilo Wifred", surname: "Khanyile", email_address: "Ss.khanyile2@gmail.com", cell_number: "0794303423", driver_code: "EPS15321" },
  { id: 176, first_name: "Sakhile Cedric", surname: "Sikayi", email_address: "Sakhile.sikayi@gmail.com", cell_number: "0842006454", driver_code: "EPS44551" },
  { id: 177, first_name: "Ncedile", surname: "Mqolo", email_address: "ncedilemqolo@gmail.com", cell_number: "0608663887", driver_code: "EPS11231" },
  { id: 179, first_name: "Ikageng", surname: "Malebana", email_address: "Ikagengmalebana321@gmail.com", cell_number: "0825449690", driver_code: "EPS11434" },
  { id: 180, first_name: "Mduduzi Carlos", surname: "Milanzi", email_address: "mduduzi.milanzi@eps-driver.com", cell_number: "0697635529", driver_code: "EPS31451" },
  { id: 182, first_name: "Zamokwakhe", surname: "Makhaza", email_address: "zamahzamah67@gmail.com", cell_number: "0711773266", driver_code: "EPS34512" },
  { id: 184, first_name: "Thabo Prince", surname: "Mnguni", email_address: "princethabo@gmail.com", cell_number: "0710995746", driver_code: "EPS43144" },
  { id: 186, first_name: "Njabulo Patrick", surname: "Mjoli", email_address: "mjolinjabulo@gmail.com", cell_number: "0676289186", driver_code: "EPS51434" },
  { id: 187, first_name: "Oupa Josia", surname: "Motaung", email_address: "oupa.motaung@eps-driver.com", cell_number: "0735692769", driver_code: "EPS33214" },
  { id: 188, first_name: "Thabang", surname: "Mokoena", email_address: "thabanggodfrey84@gmail.com", cell_number: "0728682898", driver_code: "EPS23214" },
  { id: 189, first_name: "Tshinyelo Cecil", surname: "Makhumisane", email_address: "tshinyelomakhumisane49@gmail.com", cell_number: "0634173538", driver_code: "EPS45531" },
  { id: 190, first_name: "Mpho Gift", surname: "Ndluzele", email_address: "Mphondluzele4@gmail.com", cell_number: "0783839674", driver_code: "EPS21435" },
  { id: 192, first_name: "Wandile", surname: "Zindlovu", email_address: "Wandilezindlovu@gmail.com", cell_number: "0699722324", driver_code: "EPS31354" },
  { id: 194, first_name: "Andries Habofanoe", surname: "Lesawana", email_address: "sawankie@gmail.com", cell_number: "0766611144", driver_code: "EPS51214" },
  { id: 196, first_name: "Avumile Simon", surname: "Nkukhu", email_address: "avumilesimon81@gmail.com", cell_number: "0617742614", driver_code: "EPS34535" },
  { id: 197, first_name: "Nelisile", surname: "Ncokwane", email_address: "ncokwanenelisile@gmail.com", cell_number: "0795593703", driver_code: "EPS24241" },
  { id: 200, first_name: "Mndeni Enock ", surname: "Mdlalose", email_address: "me85mdlalose1@gmail.com", cell_number: "0825342512", driver_code: "EPS13425" }
];

async function createDriverAuth() {
    console.log('Starting driver auth creation process...\n');
    
    for (const driver of drivers) {
        try {
            console.log(`Processing ${driver.first_name} ${driver.surname} (${driver.email_address})...`);
            
            // Check if user already exists in auth
            const { data: existingUser } = await supabase.auth.admin.listUsers();
            const userExists = existingUser.users.find(u => u.email === driver.email_address);
            
            if (userExists) {
                console.log(`  ✓ User already exists in auth with ID: ${userExists.id}`);
                
                // Check if user exists in users table
                const { data: userRecord } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', userExists.id)
                    .single();
                
                if (!userRecord) {
                    // Add to users table
                    const { error: userError } = await supabase
                        .from('users')
                        .insert({
                            id: userExists.id,
                            email: driver.email_address,
                            role: 'driver',
                            phone: driver.cell_number
                        });
                    
                    if (userError) {
                        console.log(`  ✗ Error adding to users table: ${userError.message}`);
                    } else {
                        console.log(`  ✓ Added to users table`);
                    }
                }
                
                // Update drivers table with user_id
                const { error: driverError } = await supabase
                    .from('drivers')
                    .update({ user_id: userExists.id })
                    .eq('id', driver.id);
                
                if (driverError) {
                    console.log(`  ✗ Error linking driver: ${driverError.message}`);
                } else {
                    console.log(`  ✓ Linked driver to auth user`);
                }
                
            } else {
                // Create new auth user
                const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
                    email: driver.email_address,
                    password: driver.driver_code,
                    email_confirm: true
                });
                
                if (authError) {
                    console.log(`  ✗ Error creating auth user: ${authError.message}`);
                    continue;
                }
                
                console.log(`  ✓ Created auth user with ID: ${newUser.user.id}`);
                
                // Add to users table
                const { error: userError } = await supabase
                    .from('users')
                    .insert({
                        id: newUser.user.id,
                        email: driver.email_address,
                        role: 'driver',
                        phone: driver.cell_number
                    });
                
                if (userError) {
                    console.log(`  ✗ Error adding to users table: ${userError.message}`);
                } else {
                    console.log(`  ✓ Added to users table`);
                }
                
                // Update drivers table with user_id
                const { error: driverError } = await supabase
                    .from('drivers')
                    .update({ user_id: newUser.user.id })
                    .eq('id', driver.id);
                
                if (driverError) {
                    console.log(`  ✗ Error linking driver: ${driverError.message}`);
                } else {
                    console.log(`  ✓ Linked driver to auth user`);
                }
            }
            
            console.log('');
            
        } catch (error) {
            console.log(`  ✗ Unexpected error: ${error.message}\n`);
        }
    }
    
    console.log('Driver auth creation process completed!');
}

createDriverAuth();