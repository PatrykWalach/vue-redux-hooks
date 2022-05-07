@deriving(accessors)
type reduxContext<'s, 'd> = {
  store: Redux.store<'s, 'd>,
  state: Vue.computedRef<'s>,
}

@genType
let useStore = (reduxKey, . ()) => {
  let ctx = Vue.inject(reduxKey)

  switch ctx {
  | None =>
    Js.Exn.raiseError(
      "Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks",
    )
  | Some(redux) => redux.store
  }
}
