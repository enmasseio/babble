# TO DO

- Implement error handling
- Implement support for other pubsub solutions, like pubnub.
- Find a better name for `act` (`reply`? `listen`? `conversation`? `talk`?).
  Or split in multiple different types having an explicit use case?
- Provide the context as function argument instead of as `this`?
- Store message history in context.
- What to do with initial message and data, whilst subsequent calls only have
  message?
- Change to JSON-RPC under the hood?
- implement and test conversations with multiple peers at the same time.
