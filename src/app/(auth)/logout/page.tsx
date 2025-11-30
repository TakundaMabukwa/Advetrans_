import { logout } from "@/lib/action/logout"
import { redirect } from "next/navigation"

export default async function LogoutPage() {
  await logout()
  return redirect('/login') 
}
