# babble history
https://github.com/enmasseio/babble


## 2014-08-01, version 0.7.0

- On creation, a babbler is now automatically connected to the default (local) 
  message bus.
- Changed function `Babbler.connect` to return a Promise instead of accepting
  a callback function as last parameter.
- Added function `babble.ask`.
- Added function `Block.ask`.
- Changed the API for messagers: `connect` must return a token, and a messager
  must contain a function `disconnect(token)`.
- Implemented support for babblifying actors.


## 2014-02-14, version 0.6.0

- Renamed functions `publish`, `subscribe`, `unsubscribe` to `send`, `connect`,
  and `disconnect`. Renamed namespace `pubsub` to `messengers`.


## 2014-01-13, version 0.5.0

- Messages can now be of any type, not only string.
- Consistency of API improved.
- Improved examples.


## 2014-01-10, version 0.4.0

- API changed into a chained API.


## 2014-01-03, version 0.3.1

- Documentation and examples added.
- Minor bug fixes and improvements.


## 2014-01-02, version 0.3.0

- Implemented customizable pubsub system.
- Implemented support for pubnub.
- Implemented browser support.


## 2013-12-31, version 0.2.0

- Changed to flow based: Reply, Action, Decision, Trigger.


## 2013-12-24, version 0.1.0

- Initial release, callback based.