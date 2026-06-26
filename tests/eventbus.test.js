const EventBus = require('../src/eventbus');

describe('EventBus', () => {
  let bus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on / emit', () => {
    test('calls a registered listener when the event is emitted', () => {
      const handler = jest.fn();
      bus.on('data', handler);
      bus.emit('data', 42);
      expect(handler).toHaveBeenCalledWith(42);
    });

    test('passes multiple arguments to the handler', () => {
      const handler = jest.fn();
      bus.on('msg', handler);
      bus.emit('msg', 'hello', 'world');
      expect(handler).toHaveBeenCalledWith('hello', 'world');
    });

    test('calls all listeners registered for the same event', () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      bus.on('tick', h1);
      bus.on('tick', h2);
      bus.emit('tick');
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });

    test('does not call listeners for a different event', () => {
      const handler = jest.fn();
      bus.on('a', handler);
      bus.emit('b');
      expect(handler).not.toHaveBeenCalled();
    });

    test('returns false when no listeners exist for the event', () => {
      expect(bus.emit('ghost')).toBe(false);
    });

    test('returns true when at least one listener is called', () => {
      bus.on('ping', jest.fn());
      expect(bus.emit('ping')).toBe(true);
    });

    test('on() is chainable', () => {
      expect(bus.on('a', jest.fn())).toBe(bus);
    });
  });

  describe('once', () => {
    test('fires the handler exactly once', () => {
      const handler = jest.fn();
      bus.once('click', handler);
      bus.emit('click');
      bus.emit('click');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('removes the once listener after it fires', () => {
      bus.once('open', jest.fn());
      bus.emit('open');
      expect(bus.listenerCount('open')).toBe(0);
    });

    test('once and on listeners can coexist on the same event', () => {
      const permanent = jest.fn();
      const oneTime = jest.fn();
      bus.on('update', permanent);
      bus.once('update', oneTime);
      bus.emit('update');
      bus.emit('update');
      expect(permanent).toHaveBeenCalledTimes(2);
      expect(oneTime).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    test('stops calling a removed listener', () => {
      const handler = jest.fn();
      bus.on('change', handler);
      bus.off('change', handler);
      bus.emit('change');
      expect(handler).not.toHaveBeenCalled();
    });

    test('only removes the specified handler, not others', () => {
      const h1 = jest.fn();
      const h2 = jest.fn();
      bus.on('event', h1);
      bus.on('event', h2);
      bus.off('event', h1);
      bus.emit('event');
      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalledTimes(1);
    });

    test('is a no-op for an event with no listeners', () => {
      expect(() => bus.off('nonexistent', jest.fn())).not.toThrow();
    });

    test('off() is chainable', () => {
      const h = jest.fn();
      bus.on('x', h);
      expect(bus.off('x', h)).toBe(bus);
    });
  });

  describe('listenerCount', () => {
    test('returns 0 for an event with no listeners', () => {
      expect(bus.listenerCount('nothing')).toBe(0);
    });

    test('returns the correct count as listeners are added', () => {
      bus.on('e', jest.fn());
      bus.on('e', jest.fn());
      expect(bus.listenerCount('e')).toBe(2);
    });

    test('decrements after off()', () => {
      const h = jest.fn();
      bus.on('e', h);
      bus.on('e', jest.fn());
      bus.off('e', h);
      expect(bus.listenerCount('e')).toBe(1);
    });
  });

  describe('eventNames', () => {
    test('returns an empty array when no events are registered', () => {
      expect(bus.eventNames()).toEqual([]);
    });

    test('lists all events that have at least one listener', () => {
      bus.on('alpha', jest.fn());
      bus.on('beta', jest.fn());
      expect(bus.eventNames()).toEqual(expect.arrayContaining(['alpha', 'beta']));
      expect(bus.eventNames()).toHaveLength(2);
    });

    test('does not list an event after its last listener is removed', () => {
      const h = jest.fn();
      bus.on('temp', h);
      bus.off('temp', h);
      expect(bus.eventNames()).not.toContain('temp');
    });
  });

  describe('removeAllListeners', () => {
    test('removes all listeners for a specific event', () => {
      bus.on('flood', jest.fn());
      bus.on('flood', jest.fn());
      bus.removeAllListeners('flood');
      expect(bus.listenerCount('flood')).toBe(0);
    });

    test('does not affect listeners on other events', () => {
      bus.on('keep', jest.fn());
      bus.on('drop', jest.fn());
      bus.removeAllListeners('drop');
      expect(bus.listenerCount('keep')).toBe(1);
    });

    test('removes all listeners on all events when called without an argument', () => {
      bus.on('a', jest.fn());
      bus.on('b', jest.fn());
      bus.removeAllListeners();
      expect(bus.eventNames()).toHaveLength(0);
    });
  });
});
