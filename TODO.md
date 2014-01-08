# TO DO

- Change API to chained.
- Change Decision(callback) to Decision(decision, flows)
- Implement error handling
- Implement support for promises to allow async callback functions
- Provide the context as function argument instead of as `this`?
- Store message history in context.
- What to do with initial message and data, whilst subsequent calls only have
  message? -> rename this stuff? an initial `event` with optional `message`,
  and only subsequal `message`.
- Change to JSON-RPC under the hood?
- implement conversations with multiple peers at the same time.
