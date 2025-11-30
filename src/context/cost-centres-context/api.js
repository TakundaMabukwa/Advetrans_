// actions
import * as api from './actions'
import { createClient } from '@/lib/supabase/client'

// *****************************
// fetch cost centre (Supabase)
// *****************************
export const fetchCostCentres = async (costCentresDispatch) => {
  try {

  


    const supabase = createClient()
    const { data, error } = await supabase.from('breakdown_cost_centers').select('*')
    if (error) {
      console.error('fetchCostCentres supabase error:', error)
      costCentresDispatch(api.fetchCostCentresFailure(error))
      return
    }
    console.debug('fetchCostCentres result:', data)
    costCentresDispatch(api.fetchCostCentresSuccess(data || []))
  } catch (err) {
    console.error('fetchCostCentres exception:', err)
    costCentresDispatch(api.fetchCostCentresFailure(err))
  }
}

// *****************************
// add cost centre
// *****************************
const addCostCentre = async (costCentre, costCentresDispatch) => {
  costCentresDispatch(api.addCostCentresStart())
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('breakdown_cost_centers').insert(costCentre).select()
    if (error) {
      console.error('addCostCentre supabase error:', error)
      costCentresDispatch(api.addCostCentresFailure(error))
      return
    }
    // dispatch success with new row
    console.debug('addCostCentre inserted row:', data)
    costCentresDispatch(api.addCostCentresSuccess(data?.[0] || data))
    // refresh the full list to guarantee UI consistency with DB
    try {
      await fetchCostCentres(costCentresDispatch)
    } catch (e) {
      // swallow refresh errors but log
      console.error('fetchCostCentres after add error', e)
    }
  } catch (err) {
    console.error('addCostCentre exception:', err)
    costCentresDispatch(api.addCostCentresFailure(err))
  }
}

// *****************************
// update cost centre
// *****************************
const updateCostCentre = async (id, costCentre, costCentresDispatch) => {
  costCentresDispatch(api.updateCostCentreStart())
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('breakdown_cost_centers')
      .update(costCentre)
      .eq('id', id)
      .select()
    if (error) {
      console.error('updateCostCentre supabase error:', error)
      costCentresDispatch(api.updateCostCentreFailure(error))
      return
    }
    console.debug('updateCostCentre updated row:', data)
    costCentresDispatch(api.updateCostCentreSuccess(data?.[0] || data))
    // refresh the full list to ensure UI has DB's latest snapshot
    try {
      await fetchCostCentres(costCentresDispatch)
    } catch (e) {
      console.error('fetchCostCentres after update error', e)
    }
  } catch (err) {
    console.error('updateCostCentre exception:', err)
    costCentresDispatch(api.updateCostCentreFailure(err))
  }
}

// *****************************
// move upsert to hooks or helpers(chat with cam)
// *****************************
export const upsertCostCentre = async (id, costCentre, costCentresDispatch) =>
  id ? updateCostCentre(id, costCentre, costCentresDispatch) : addCostCentre(costCentre, costCentresDispatch)

// *****************************
// delete cost centre
// *****************************
export const deleteCostCentre = async (id, costCentresDispatch) => {
  costCentresDispatch(api.deleteCostCentreStart())
  try {
    const supabase = createClient()
    const { error } = await supabase.from('breakdown_cost_centers').delete().eq('id', id)
    if (error) {
      console.error('deleteCostCentre supabase error:', error)
      costCentresDispatch(api.deleteCostCentreFailure(error))
      return
    }
    console.debug('deleteCostCentre success id:', id)
    costCentresDispatch(api.deleteCostCentreSuccess(id))
  } catch (err) {
    console.error('deleteCostCentre exception:', err)
    costCentresDispatch(api.deleteCostCentreFailure(err))
  }
}
