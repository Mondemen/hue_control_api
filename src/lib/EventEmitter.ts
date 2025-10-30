export interface EventSubscription<T = any>
{
	id: string, /** Event ID. */
	listener: T, /** Function to invoke when the specified event is. */
	remove: () => void /** Removes this subscription from the emitter that registered it. */
}

export default class EventListener
{
	protected _events: any = {};
	protected _onceEvents: any = {};

	emit(eventName: string, ...args: any)
	{
		for (const id in this._events[eventName])
			this._events[eventName][id]?.(...args);
		for (const id in this._onceEvents[eventName])
			this._onceEvents[eventName][id]?.(...args);
		delete this._onceEvents[eventName];
	}

	/**
	 * Adds the listener function to the end of the listeners array for the event named eventName
	 */
	on(eventName: string, listener: (...args: any) => any): EventSubscription
	{
		let id: string;

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
	 */
	once(eventName: string, listener: (...args: any) => void): EventSubscription
	{
		let id: string;

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
	 */
	off(eventName: string, listener: (...args: any) => void)
	{
		let id: string | undefined;

		if (arguments.length >= 2)
		{
			id = Object.entries(this._events[eventName]).find(([, func]: [string, () => void]) => func.toString() === listener.toString())?.[0];
			if (id)
				delete this._events?.[eventName]?.[id];
			if (this._events?.[eventName] && !Object.keys(this._events[eventName] ?? {}).length)
				delete this._events[eventName];
		}
		else
			delete this._events[eventName];
	}

	removeAllListeners(eventName: string)
	{
		delete this._onceEvents[eventName];
		delete this._events[eventName];
	}
}