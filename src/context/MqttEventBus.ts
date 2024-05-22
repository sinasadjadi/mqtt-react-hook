type TEventCallback = (payload: ArrayBuffer) => void

interface IEventBus {
    bus: Map<string, Record<string, TEventCallback>>
    $off: (topic: string, id: string) => void
    $on: (topic: string, id: string, callback: TEventCallback) => void
    $emit: (topic: string, payload: ArrayBuffer) => void
    $clear: () => void
    getListeners: (topic: string) => Record<string, TEventCallback | never>
}

class EventBus implements IEventBus {
    bus: IEventBus["bus"]

    constructor() {
        this.bus = new Map();
    }

    $off(topic: string, id: string) {
        const value = this.bus.get(topic) || {}
        delete value[id]
        if (!Object.keys(value).length)
            this.bus.delete(topic)
    }

    $on(topic: string, id: string, callback: TEventCallback) {

        const value = this.bus.get(topic) || {}
        value[id] = callback
        this.bus.set(topic, value)
    }

    $emit(topic: string, payload: ArrayBuffer) {
        const item = this.bus.get(topic)
        if (item)
            Object.values(item).map(callback => callback(payload))
    }

    $clear() {
        this.bus.clear()
    }

    getListeners(topic: string) {
        return this.bus.get(topic) || {}
    }
}

export const MqttMessageEventBus = new EventBus();

