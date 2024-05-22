import {
    TUnSubscribedTopicParams,
    TUtilsResponse,
} from '@/types';
import {useReactMqtt} from "@/context";
import {useState} from "react";
import {Cache} from "@/store";

export default function useMqttUtils(): TUtilsResponse {

    const [cache] = useState(new Cache())
    const {mqtt: mqttClient} = useReactMqtt();

    const unSubscribeTopic = ({topic, options = undefined}: TUnSubscribedTopicParams) => {
        return mqttClient?.unsubscribeAsync(topic, options);
    };

    const getCache = (topic: string, buffer: boolean = false) => {
        const item = cache.getCache(topic)
        if (!item)
            return undefined
        if (buffer)
            return item
        return {
            ...item,
            payload: JSON.parse(item.payload?.toString() || "{}")
        }
    }

    const deleteCache = (topic: string) => {
        return cache.deleteCache(topic)
    }

    const clearCache = () => {
        return cache.clearCache()
    }

    return {unSubscribeTopic, getCache, deleteCache, clearCache};
}
