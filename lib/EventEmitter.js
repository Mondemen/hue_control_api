/**
 * @typedef EventSubscription
 * @type {Object}
 * @property {string} id Event ID.
 * @property {Function} listener Function to invoke when the specified event is.
 * @property {Function} remove Removes this subscription from the emitter that registered it.
 */

export default class EventListener
{
	/**
	 * @type {Object<string, Object<string, Function>>}
	 * @private
	 */
	_events = {};
	/**
	 * @type {Object<string, Object<string, Function>>}
	 * @private
	 */
	_onceEvents = {};

	/**
	 * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
	 * @param {string} eventName The event name
	 * @param  {...any} args
	 */
	emit(eventName, ...args)
	{
		for (const id in this._events[eventName])
			this._events[eventName][id]?.(...args);
		for (const id in this._onceEvents[eventName])
			this._onceEvents[eventName][id]?.(...args);
		delete this._onceEvents[eventName];
	}

	/**
	 * Adds the listener function to the end of the listeners array for the event named eventName
	 *
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener
	 * @returns {EventSubscription} Event object, used to remove the event hen necessary
	 */
	on(eventName, listener)
	{
		let id;

		this._events[eventName] ??= {};
		id = Object.keys(this._events[eventName]).length.toString();
		this._events[eventName][id] = listener;
		return ({
			id,
			listener,
			remove: () =>
			{
				delete this._events?.[eventName]?.[id];
				if (this._events?.[eventName] && !Object.keys(this._events[eventName] ?? {}).length)
					delete this._events[eventName];
			}
		});
	}

	/**
	 * Adds a one-time listener function for the event named eventName
	 *
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener
	 * @returns {EventSubscription} Event object, used to remove the event hen necessary
	 */
	once(eventName, listener)
	{
		let id;

		this._onceEvents[eventName] ??= {};
		id = Object.keys(this._onceEvents[eventName]).length.toString();
		this._onceEvents[eventName][id] = listener;
		return ({
			id,
			listener,
			remove: () =>
			{
				delete this._onceEvents?.[eventName]?.[id];
				if (this._onceEvents?.[eventName] && !Object.keys(this._onceEvents[eventName] ?? {}).length)
					delete this._onceEvents[eventName];
			}
		});
	}

	/**
	 * Removes the specified listener from the listener array for the event named eventName.
	 *
	 * @param {string} eventName The event name
	 * @param {Function} listener The listener to remove or not
	 */
	off(eventName, listener)
	{
		let id;

		if (arguments.length >= 2)
		{
			id = Object.entries(this._events[eventName])?.find?.(([id, func]) => func.toString() == listener.toString())?.map?.(([id, func]) => id);
			delete this._events?.[eventName]?.[id];
			if (this._events?.[eventName] && !Object.keys(this._events[eventName] ?? {}).length)
				delete this._events[eventName];
		}
		else
			delete this._events[eventName];
	}

	removeAllListeners(eventName)
	{
		delete this._onceEvents[eventName];
		delete this._events[eventName];
	}
}