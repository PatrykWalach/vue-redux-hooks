@genType.import(("@reduxjs/toolkit/query", "SkipToken"))
type skipToken

@genType.import(("@reduxjs/toolkit/query", "QueryStatus"))
type queryStatus

@module("@reduxjs/toolkit/query")
external skipToken: skipToken = "skipToken"

type result<'d> = {
  status: queryStatus,
  isUninitialized: bool,
  isLoading: bool,
  isSuccess: bool,
  isError: bool,
  requestId: option<unit>,
  data: option<'d>,
  error: option<unit>,
  endpointName: option<string>,
  startedTimeStamp: option<int>,
  fulfilledTimeStamp: option<int>,
}

@genType @deriving(accessors)
type arg<'a> = {originalArgs: 'a}

type subscriptionOptions = {
  refetchOnReconnect: option<bool>,
  refetchOnFocus: option<bool>,
  pollingInterval: option<int>,
}

@genType @deriving(accessors)
type promise<'a> = {
  requestId: string,
  arg: arg<'a>,
  subscriptionOptions: subscriptionOptions,
}

@send
external updateSubscriptionOptions: (promise<'a>, subscriptionOptions) => unit =
  "updateSubscriptionOptions"

@send external unsubscribe: promise<'a> => unit = "unsubscribe"
@send external refetch: promise<'a> => unit = "refetch"

@genType
type endpoint<'a, 's, 'e, 'd>

@send
external selectArg: (endpoint<'a, 's, 'e, 'd>, 'a, 's) => result<'d> = "select"

@send
external selectSkip: (endpoint<'a, 's, 'e, 'd>, skipToken, 's) => result<'d> = "select"

@genType
@deriving(abstract)
type initiateOptions = {
  @optional subscriptionOptions: subscriptionOptions,
  @optional forceRefetch: bool,
}

@send
external initiate: (
  endpoint<'a, 's, 'e, 'd>,
  'a,
  ~options: initiateOptions=?,
  unit,
) => Redux.thunkAction<promise<'a>, 's, 'e> = "initiate"

type stableArg<'a> = Skip(skipToken) | Arg('a)

let select = (endpoint, stableArg) =>
  switch stableArg {
  | Skip(token) => endpoint->selectSkip(token)
  | Arg(arg) => endpoint->selectArg(arg)
  }
