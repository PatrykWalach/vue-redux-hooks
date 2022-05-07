@genType.import(("redux", "ThunkAction"))
type thunkAction<'r, 's, 'e>

type thunkDispatch<'r, 's, 'e> = thunkAction<'r, 's, 'e> => 'r

type dispatch<'a> = 'a => 'a

@genType @deriving(accessors)
type store<'s, 'd> = {
  dispatch: 'd,
  getState: unit => 's,
}
