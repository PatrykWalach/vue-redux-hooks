@genType
let createUseQuery = (endpoint, reduxKey) => {
  let useQueryState = UseQueryState.createUseQueryState(endpoint, reduxKey)
  let useQuerySubscription = UseQuerySubscription.createUseQuerySubscription(endpoint, reduxKey)

  (
    arg,
    ~skip=?,
    ~pollingInterval=?,
    ~refetchOnMountOrArgChange=?,
    ~refetchOnReconnect=?,
    ~refetchOnFocus=?,
    (),
  ) => {
    let subscription = useQuerySubscription(
      arg,
      ~skip?,
      ~pollingInterval?,
      ~refetchOnMountOrArgChange?,
      ~refetchOnReconnect?,
      ~refetchOnFocus?,
      (),
    )

    let state = useQueryState(arg, ~skip?, ())

    {
      "refetch": subscription["refetch"],
      "isUninitialized": state["isUninitialized"],
      "isError": state["isError"],
      "error": state["error"],
      "status": state["status"],
      "startedTimeStamp": state["startedTimeStamp"],
      "requestId": state["requestId"],
      // "originalArgs": state["originalArgs"],
      "fulfilledTimeStamp": state["fulfilledTimeStamp"],
      "endpointName": state["endpointName"],
      "data": state["data"],
      "isFetching": state["isFetching"],
      "isLoading": state["isLoading"],
      "isSuccess": state["isSuccess"],
    }
  }
}
