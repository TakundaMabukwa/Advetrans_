import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let companyName = null
    if (profile.client_id) {
      const { data: company, error: companyError } = await supabase
        .from('clients')
        .select('name')
        .eq('id', profile.client_id)
        .single()
      if (!companyError && company) companyName = company.name
    }

    const currentUser = { company: companyName, ...profile }
    return NextResponse.json(currentUser, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
//     user = await auth.verifyIdToken(authToken)
//   } catch (error) {
//     console.log('error :>> ', error)
//   }
// }
// if (!db || !auth) {
//   return NextResponse.json('Internal Error: no firebase', {
//     status: 500,
//   })
// }
// const authToken =
//   (await request.headers.get('Authorization')?.split('Bearer ')[1]) || null
// //console.log('authToken :>> ', authToken)

// try {
// if (!db) {
//   return NextResponse.json('Internal Error: no firebase', {
//     status: 500,
//   })
// }
//   const authToken =
//     req.headers.get('authorization')?.split('bearer ')[1] || null
//   let user = null
//   if (auth && authToken) {
//     try {
//       user = await auth.verifyIdToken(authToken)
//     } catch (error) {
//       console.log('error :>> ', error)
//     }
//   }
//   console.log('user :>> ', user)

//   const userData = await db.getUser(user.uid)
//   return NextResponse.json(userData, { status: 200 })
// } catch (error) {
//   console.log('error :>> ', error)
//   return NextResponse.json(`Internal Error: ${error}`, {
//     status: 500,
//   })
// }
