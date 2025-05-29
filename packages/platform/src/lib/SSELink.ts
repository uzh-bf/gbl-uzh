// ref: https://the-guild.dev/graphql/sse/recipes#with-apollo

import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
} from '@apollo/client/core'
import { print } from 'graphql'
import {
  Client,
  ClientOptions,
  createClient,
  ExecutionResult,
} from 'graphql-sse'

class SSELink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions) {
    super()
    this.client = createClient(options)
  }

  public override request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: (value: ExecutionResult<FetchResult, unknown>) => {
            sink.next(value as FetchResult)
            // sink.next({
            //   data: value.data,
            //   errors: value.errors,
            //   extensions: value.extensions,
            // } as FetchResult)
          },
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        }
      )
    })
  }
}

export default SSELink
