@genType.import(("vue-demi", "InjectionKey"))
type injectionKey<'t>

@genType
type ref<'t> = {mutable value: 't}

@genType @deriving(accessors)
type computedRef<'t> = {value: 't}

@module("vue-demi")
external inject: injectionKey<'t> => option<'t> = "inject"

@module("vue-demi")
external computed: (@uncurry (unit => 't)) => computedRef<'t> = "computed"

@module("vue-demi")
external shallowRef: 't => ref<'t> = "shallowRef"

@module("vue-demi")
external ref: 't => ref<'t> = "ref"

@module("vue-demi")
external shallowRefEmpty: unit => ref<option<'t>> = "shallowRef"

@module("vue-demi")
external refEmpty: unit => ref<option<'t>> = "ref"

type watchOptions = {@optional immediate: bool}

@module("vue-demi")
external watchEffect: (
  @uncurry (((. unit => unit) => unit) => unit),
  ~options: watchOptions=?,
  unit,
) => unit = "watchEffect"

@module("vue-demi")
external watch1: (
  computedRef<'t>,
  @uncurry ('t, 't, (. unit => unit) => unit) => unit,
  ~options: watchOptions=?,
  unit,
) => unit = "watch"

@module("vue-demi")
external watch3: (
  (computedRef<'t1>, computedRef<'t2>, computedRef<'t3>),
  @uncurry (('t1, 't2, 't3), ('t1, 't2, 't3), (. unit => unit) => unit) => unit,
  ~options: watchOptions=?,
  unit,
) => unit = "watch"

@genType.import(("./util", "Reactive"))
type option_ref<'t>

@module("vue-demi")
external unref: option_ref<'t> => 't = "unref"

let getWithDefault = (option_ref, default) =>
  switch option_ref {
  | Some(value) => unref(value)
  | None => default
  }
