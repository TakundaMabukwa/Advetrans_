// actions
import * as api from './actions'

import { createClient } from '@/lib/supabase/client'

// *****************************
// fetch users (Supabase)
// *****************************
export const fetchUsers = async (usersDispatch) => {
	usersDispatch(api.fetchUsersStart())
	try {
		const supabase = createClient()
		const { data, error } = await supabase.from('users').select('*')
		if (error) {
			console.error('fetchUsers error', error)
			usersDispatch(api.fetchUsersFailure(error))
			return
		}
		usersDispatch(api.fetchUsersSuccess(data || []))
	} catch (err) {
		console.error('fetchUsers exception', err)
		usersDispatch(api.fetchUsersFailure(err))
	}
}

// Note: add/update/delete helpers still use server proxies in this repo. Convert as needed.
