import { inject } from '@vue/composition-api'
import { Store } from 'redux'
import { key } from '../install'

export const useStore = () => inject(key) as Store
