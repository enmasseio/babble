# TO DO

- Rename block Reply to Send?
- Change Babbler.ask such that it doesn't do two steps (Send and Listen)?
- Implement error handling
- Implement support for promises to allow async callback functions
- Store message history in context.
- What to do with initial message and data, whilst subsequent calls only have
  message? -> rename this stuff? an initial `event` with optional `message`,
  and sequential only a `message`.
- implement conversations with multiple peers at the same time.
