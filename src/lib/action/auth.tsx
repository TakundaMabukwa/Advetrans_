"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: resData } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log(error);
    return { success: false, message: error.message };
  }

  // Query the users table to get the role for the logged-in user
  const { data: userRecord, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", resData.user.id)
    .single();

  if (userError || !userRecord) {
    console.log("Failed to get role from users table", userError);
    return { success: false, message: "Failed to fetch user role" };
  }

  // Ensure role is present (string) before setting cookie
  const role = userRecord.role;
  if (!role) {
    console.log("Failed to get role from users table", userError);
    return { success: false, message: "Failed to fetch user role" };
  }
  
  const cookieStore = await cookies();
  cookieStore.set("access_token", resData.session.access_token);
  cookieStore.set("refresh_token", resData.session.refresh_token);
  cookieStore.set("role", role);
  cookieStore.set("userId", resData.user.id);

  revalidatePath("/", "layout");

  return { success: true };
}

export async function signup(formData: FormData) {
  const role = formData.get("role") as string;
  const fullName = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  if (
    role !== "fleet manager" &&
    role !== "customer" &&
    role !== "call centre" &&
    role !== "cost centre" &&
    role !== "fc"
  ) {
    redirect(`/signup?message=Role not found`);
  }
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        name: fullName,
        phone,
        role: role,
      },
    },
  };
  const supabase = await createClient();
  const { error, data: signs } = await supabase.auth.signUp(data);
  if (error) {
    redirect("/signup?message=" + error.message);
  }

  const { error: inserterror, data: profile } = await supabase.from("users").insert(
    {
      // @ts-expect-error
      id: signs.session?.user.id,
      full_name: fullName,
      role,
      phone_number: phone,
      email: data.email,
    },
  );

  if (inserterror) {
    console.log("error : " + inserterror?.message);
  }

  console.log("User ID:", profile);
  console.log("Metadata:", data.options.data);


  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.getUser();

  if (error) {
    return redirect(`/error?error=${error.message}`);
  }

  const { data: user, error: error2 } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (error2) {
    return redirect(`/error?error=${error2.message}`);
  }

  data.user.user_metadata = { ...user };

  return data;
}

export async function acceptInvite(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    token: formData.get("access_token") as string,
    type: "invite",
    email: formData.get("email") as string,
  });

  console.log(data, error);

  if (error) {
    redirect(`/error?message=${error.message}`);
  }

  // revalidatePath("/", "layout");
  // redirect("/");
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    formData.get("email") as string,

    {
      // redirectTo: "",
      // redirectTo: "http://localhost:3000/signup",
      data: {
        role: formData.get("role") as string,
      },
    }
  );
  if (error) {
    console.log(error);
    redirect(`/error?message=${error.message}`);
  } else {
    redirect("/");
  }
}


export async function ChangePassword(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    redirect(`/error?message=${error.message}`);
  }
  const { data: user, error: errors } = await supabase.auth.updateUser({
    password: formData.get("password") as string,
  });
  if (errors) {
    redirect(`/error?message=${errors.message}`);
  }
}


export async function sendPasswordReset(email: string) {
  const supabase = await createClient();
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "",
  });
}
export async function sendPasswordResetComplete(email: string, newpassword: string, token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(token);

  if (error) {
    redirect(`/error?message=${error.message}`);
  }

  const { error: error2 } = await supabase.auth.updateUser({
    email: email,
    password: newpassword,
  });

  if (error2) {
    redirect(`/error?message=${error2.message}`);
  }

  redirect("/");

}


export async function getUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    redirect(`/error?message=${error.message}`);
  }
  console.log("The data is", data.user?.id)
  return data.user.id;
}


