// actions
import * as api from './actions'

import { createClient } from '@/lib/supabase/client'

// *****************************
// fetch clients (Supabase)
// *****************************
export const fetchClients = async (clientsDispatch) => {
  clientsDispatch(api.fetchClientsStart())
  try {
    const supabase = createClient()
    // Try the expected table name first, then fall back to an alternate name if needed
    let data
    let error
    let usedTable = null

    ({ data, error } = await supabase.from('clients').select('*'))
    if (!error && Array.isArray(data) && data.length >= 0) usedTable = 'clients'

    // If no rows and no explicit error, try singular fallback (some code uses 'client')
    if (!usedTable) {
      ({ data, error } = await supabase.from('client').select('*'))
      if (!error && Array.isArray(data)) usedTable = 'client'
    }

    console.debug('fetchClients usedTable=', usedTable, 'rows=', (data || []).length)

    if (error) {
      console.error('fetchClients error', error)
      clientsDispatch(api.fetchClientsFailure(error))
      return
    }

    clientsDispatch(api.fetchClientsSuccess(data || []))
  } catch (err) {
    console.error('fetchClients exception', err)
    clientsDispatch(api.fetchClientsFailure(err))
  }
}

// *****************************
// add client
// *****************************
// export const addClient = async (clients, clientsDispatch) => {
//   clientsDispatch(api.addClientsStart())

//   try {
//     const token = Cookies.get('firebaseIdToken')
//     if (!token) {
//       clientsDispatch(api.addClientsFailure({ error: 'invalid user' }))
//       return
//     }

//     const response = await axios.post(`${API_URL}`, clients, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })

//     clientsDispatch(api.addClientsSuccess(response.data))
//     toast({
//       title: 'Submission was successfully.',
//       description: `New client, with id: ${response?.data?.id} and name: ${response?.data?.name} has been created.`,
//     })
//   } catch (error) {
//     clientsDispatch(api.addClientsFailure(error))
//     toast({
//       title: 'Something went wrong',
//       description:
//         error?.response?.data?.error || error.message || 'Unknown error',
//       variant: 'destructive',
//     })
//   }
// }
const addClient = async (client, clientsDispatch) => {
  clientsDispatch(api.addClientsStart())
  try {
    const supabase = createClient()
    // Try insert into 'clients' first, then 'client' as fallback. Log which worked.
    let data
    let error
    let usedTable = null

    ({ data, error } = await supabase.from('clients').insert(client).select())
    if (!error && data) usedTable = 'clients'

    if (!usedTable) {
      ({ data, error } = await supabase.from('client').insert(client).select())
      if (!error && data) usedTable = 'client'
    }

    console.debug('addClient usedTable=', usedTable, 'inserted=', data)

    if (error) {
      clientsDispatch(api.addClientsFailure(error))
      return
    }
    // insert returns array
    clientsDispatch(api.addClientsSuccess(data?.[0] || data))
  } catch (err) {
    clientsDispatch(api.addClientsFailure(err))
  }
}

// *****************************
// update client
// *****************************
const updateClient = async (id, client, clientsDispatch) => {
  clientsDispatch(api.updateClientStart())
  try {
    const supabase = createClient()
    // Try update against plural then singular table
    let data
    let error
    let usedTable = null

    ({ data, error } = await supabase.from('clients').update(client).eq('id', id).select())
    if (!error && data) usedTable = 'clients'

    if (!usedTable) {
      ({ data, error } = await supabase.from('client').update(client).eq('id', id).select())
      if (!error && data) usedTable = 'client'
    }

    console.debug('updateClient usedTable=', usedTable, 'updated=', data)

    if (error) {
      clientsDispatch(api.updateClientFailure(error))
      return
    }
    clientsDispatch(api.updateClientSuccess(data?.[0] || data))
  } catch (err) {
    clientsDispatch(api.updateClientFailure(err))
  }
}

// *****************************
// move upsert to hooks or helpers(chat with cam)
// *****************************
export const upsertClient = async (id, clients, clientsDispatch) =>
  id ? updateClient(id, clients, clientsDispatch) : addClient(clients, clientsDispatch)

// *****************************
// delete client
// *****************************
export const deleteClient = async (id, clientsDispatch) => {
  clientsDispatch(api.deleteClientStart())
  try {
    const supabase = createClient()
    let error
    let usedTable = null

    ({ error } = await supabase.from('clients').delete().eq('id', id))
    if (!error) usedTable = 'clients'

    if (!usedTable) {
      ({ error } = await supabase.from('client').delete().eq('id', id))
      if (!error) usedTable = 'client'
    }

    console.debug('deleteClient usedTable=', usedTable, 'id=', id)

    if (error) {
      clientsDispatch(api.deleteClientFailure(error))
      return
    }
    clientsDispatch(api.deleteClientSuccess(id))
  } catch (err) {
    clientsDispatch(api.deleteClientFailure(err))
  }
}
