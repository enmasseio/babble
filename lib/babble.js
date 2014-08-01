'use strict';

var Babbler = require('./Babbler');

var Tell = require('./block/Tell');
var Listen = require('./block/Listen');
var Then = require('./block/Then');
var Decision = require('./block/Decision');

/**
 * Create a new babbler
 * @param {String} id
 * @return {Babbler} babbler
 */
exports.babbler = function (id) {
  return new Babbler(id);
};

/**
 * Create a control flow starting with a tell block
 * @param {* | Function} [message] A static message or callback function
 *                                 returning a message dynamically.
 *                                 When `message` is a function, it will be
 *                                 invoked as callback(message, context),
 *                                 where `message` is the output from the
 *                                 previous block in the chain, and `context` is
 *                                 an object where state can be stored during a
 *                                 conversation.
 * @return {Tell} tell
 */
exports.tell = function (message) {
  var callback = (typeof message === 'function') ? message : function () {
    return message;
  };

  return new Tell(callback);
};

/**
 * Send a question, listen for a response.
 * Creates two blocks: Tell and Listen.
 * This is equivalent of doing `babble.tell(message).listen(callback)`
 * @param {* | Function} message
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block} block        Last block in the created control flow
 */
exports.ask = function (message, callback) {
  return exports
      .tell(message)
      .listen(callback);
};

/**
 * Create a decision block and chain it to the current block.
 * Returns the first block in the chain.
 *
 * Syntax:
 *
 *     decide(choices)
 *     decide(decision, choices)
 *
 * Where:
 *
 *     {Function | Object} [decision]
 *                              When a `decision` function is provided, the
 *                              function is invoked as decision(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 *                              The function must return the id for the next
 *                              block in the control flow, which must be
 *                              available in the provided `choices`.
 *                              If `decision` is not provided, the next block
 *                              will be mapped directly from the message.
 *     {Object.<String, Block>} choices
 *                              A map with the possible next blocks in the flow
 *                              The next block is selected by the id returned
 *                              by the decision function.
 *
 * @param {Function | Object} arg1  Can be {function} decision or {Object} choices
 * @param {Object} [arg2]           choices
 * @return {Block} decision         The created decision block
 */
exports.decide = function (arg1, arg2) {
  // TODO: test arguments.length > 2
  return new Decision(arg1, arg2);
};

/**
 * Listen for a message
 * @param {Function} [callback] Invoked as callback(message, context),
 *                              where `message` is the just received message,
 *                              and `context` is an object where state can be
 *                              stored during a conversation. This is equivalent
 *                              of doing `listen().then(callback)`
 * @return {Block}              Returns the created Listen block
 */
exports.listen = function(callback) {
  return new Listen(callback);
};

/**
 * Create a control flow starting with a Then block
 * @param {Function} callback   Invoked as callback(message, context),
 *                              where `message` is the output from the previous
 *                              block in the chain, and `context` is an object
 *                              where state can be stored during a conversation.
 * @return {Then} then
 */
exports.then = function (callback) {
  return new Then(callback);
};

// export the babbler prototype
exports.Babbler = Babbler;

// export all flow blocks
exports.block = {
  Block: require('./block/Block'),
  Then: require('./block/Then'),
  Decision: require('./block/Decision'),
  Listen: require('./block/Listen'),
  Tell: require('./block/Tell')
};

// export messaging interfaces
exports.messagers = require('./messagers');

/**
 * Babblify an actor. The babblified actor will be extended with functions
 * `ask`, `tell`, and `listen`.
 *
 * Babble expects that messages sent via `actor.send(to, message)` will be
 * delivered by the recipient on a function `actor.onMessage(from, message)`.
 * Babble replaces the original `onMessage` with a new one, which is used to
 * listen for all incoming messages. Messages ignored by babble are propagated
 * to the original `onMessage` function.
 *
 * The actor can be restored in its original state using `unbabblify(actor)`.
 *
 * @param {Object} actor      The actor to be babblified. Must be an object
 *                            containing functions `send(to, message)` and
 *                            `onMessage(from, message)`.
 * @param {Object} [params]   Optional parameters. Can contain properties:
 *                            - id: string        The id for the babbler
 *                            - send: string      The name of an alternative
 *                                                send function available on
 *                                                the actor.
 *                            - onMessage: string The name of an alternative
 *                                                onMessage function available
 *                                                on the actor.
 * @returns {Object}          Returns the babblified actor.
 */
exports.babblify = function (actor, params) {
  var babblerId;
  if (params && params.id !== undefined) {
    babblerId = params.id;
  }
  else if (actor.id !== undefined) {
    babblerId = actor.id
  }
  else {
    throw new Error('Id missing. Ensure that either actor has a property "id", ' +
        'or provide an id as a property in second argument params')
  }

  // validate actor
  ['ask', 'tell', 'listen'].forEach(function (prop) {
    if (actor[prop] !== undefined) {
      throw new Error('Conflict: actor already has a property "' + prop + '"');
    }
  });

  var sendName = params && params.send || 'send';
  if (typeof actor[sendName] !== 'function') {
    throw new Error('Missing function. ' +
        'Function "' + sendName + '(to, message)" expected on actor or on params');
  }

  // create a new babbler
  var babbler = exports.babbler(babblerId);

  // attach onMessage function to the babbler
  var onMessageName = params && params.onMessage || 'onMessage';
  var onMessageOriginal = actor.hasOwnProperty(onMessageName) ? actor[onMessageName] : null;
  actor[onMessageName] = function (from, message) {
    var handled = babbler._onMessage(message);
    if (!handled) {
      onMessageOriginal.call(actor, from, message);
    }
  };

  // attach send function to the babbler
  babbler.send = function (to, message) {
    // FIXME: there should be no need to send a message on next tick
    setTimeout(function () {
      actor[sendName](to, message)
    }, 0)
  };

  // attach babbler functions and properties to the actor
  actor.__babbler__ = {
    babbler: babbler,
    onMessage: onMessageOriginal,
    onMessageName: onMessageName
  };
  actor.ask = babbler.ask.bind(babbler);
  actor.tell = babbler.tell.bind(babbler);
  actor.listen = babbler.listen.bind(babbler);

  return actor;
};

/**
 * Unbabblify an actor.
 * @param {Object} actor
 * @return {Object} Returns the unbabblified actor.
 */
exports.unbabblify = function (actor) {
  var __babbler__ = actor.__babbler__;
  if (__babbler__) {
    delete actor.__babbler__;
    delete actor.ask;
    delete actor.tell;
    delete actor.listen;
    delete actor[__babbler__.onMessageName];

    // restore any original onMessage method
    if (__babbler__.onMessage) {
      actor[__babbler__.onMessageName] = __babbler__.onMessage;
    }
  }

  return actor;
};
