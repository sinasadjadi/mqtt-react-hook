import {TCacheItem, TCaches} from "@/types";

export default class Cache {

    static caches: TCaches = new Map<string, TCacheItem>()

    caches!: TCaches

    constructor() {
        this.caches = Cache.caches
    }

    setCache = (topic: string, data: TCacheItem) => {
        return this.caches.set(topic, {...data, topic})
    }

    getCache = (topic: string): TCacheItem | undefined => {
        return this.caches.get(topic)
    }

    deleteCache = (topic: string) => {
        this.caches.delete(topic)
    }

    clearCache = () => {
        this.caches.clear()
    }
}
