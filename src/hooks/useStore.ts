import { Store } from 'redux'
import { inject } from '@vue/composition-api'
import { key } from '../install'

export const useStore = <S extends Store = Store>() => inject(key) as S
