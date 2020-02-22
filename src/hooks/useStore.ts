import { ReduxStore } from '../key'
import { Store } from 'redux'
import { inject } from 'vue'

export const useStore = <S extends Store = Store>() => inject(ReduxStore) as S
