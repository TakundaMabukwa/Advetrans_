import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const access_token = cookieStore.get('access_token')?.value
  const role = cookieStore.get('role')?.value

  if (!access_token || !role) {
    redirect('/login')
  }

  if (role === 'customer') {
    redirect('/drivers')
  }

  redirect('/dashboard')
}

// import { redirect } from 'next/navigation'
// import React, { useEffect } from 'react'
// import { useRouter } from "next/navigation";
// import { cookies } from 'next/dist/server/request/cookies';

// type Props = {
//   access_token: string;
//   role: string;
// };

// export default async function RedirectLoader() {
//   const router = useRouter();
//   const cookieStore = await cookies()
//   const access_token = cookieStore.get('access_token')?.value
//   const role = cookieStore.get('role')?.value

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (!access_token || !role) {
//         router.push("/login");
//         return;
//       }
//       if (role === "customer") {
//         router.push("/drivers");
//         return;
//       }
//       router.push("/dashboard");
//     }, 200); // small delay so the loader is visible briefly

//     return () => clearTimeout(timer);
//   }, [access_token, role, router]);

//   return (
//     <div
//       style={{
//         height: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexDirection: "column",
//       }}
//     >
//       <div
//         aria-hidden
//         style={{
//           width: 48,
//           height: 48,
//           borderRadius: 24,
//           border: "6px solid rgba(0,0,0,0.12)",
//           borderTopColor: "#0ea5e9",
//           animation: "spin 0.9s linear infinite",
//         }}
//       />
//       <p style={{ marginTop: 12 }}>Redirecting…</p>
//       <style jsx>{`
//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
