import React, {useState} from "react";
import {fill} from "mqtt-pattern";
import {IClientSubscribeOptions, ISubscriptionGrant} from "mqtt";
import {useReactMqtt} from "@/context";
import Deferred from "@/utilize/DeferredPromise.ts";
import {
    TSubscriptionParams,
    TSubscriptionResponse,
    TSubscribeReturnType,
    TSubscriptionStatus,
    TError,
    TPatterns,
} from "@/types";
import {v4 as uuidv4} from "uuid";
import {Cache} from "@/store";
import {validateTopic} from "@/utilize";
import useUtils from "@/hooks/useMqttUtils.ts";
import {MqttMessageEventBus} from "@/context/MqttEventBus";

export default function useSubscription<K extends keyof TPatterns = any>({
                                                                             pattern,
                                                                             params,
                                                                             onMessage,
                                                                             onSubscribeSuccess,
                                                                             onSubscribeError,
                                                                             onUnSubscribe,
                                                                             unSubscribeOptions,
                                                                             onError,
                                                                             options = {} as IClientSubscribeOptions,
                                                                             enable = true,
                                                                             cacheFirst = false,
                                                                         }: TSubscriptionParams<K>): TSubscriptionResponse<K> {
    type TResponse = {
        payload: TSubscriptionResponse<K>["payload"]
        updatedAt: TSubscriptionResponse<K>["dataUpdatedAt"]
    }
    const [response, setResponse] = React.useState<TResponse>({payload: null, updatedAt: null});
    const [errors, setErrors] = React.useState<TError>([])
    const [status, setStatus] = useState<TSubscriptionStatus>("idle")

    const deferredPromise = React.useRef<TSubscribeReturnType>();
    const hookIdRef = React.useRef<string>(uuidv4())
    const id = hookIdRef.current

    const {mqtt} = useReactMqtt();
    const {unSubscribeTopic, getCache} = useUtils()

    type TMutableStore = {
        status: TSubscriptionStatus
        topic: string
    }
    const mutableStore = React.useRef<TMutableStore>({
        status,
        topic: ""
    })
    mutableStore.current.status = status

    const setTopic = (topic: string) => mutableStore.current.topic = topic

    const validation = React.useMemo(() => validateTopic(pattern as string, params), [pattern, params])

    const isReady = React.useMemo<boolean>(() => validation.result && !!mqtt?.connected, [mqtt?.connected, pattern, params]);

    const listen = (topic: string) => MqttMessageEventBus.$on(topic, id, clb)

    const unListen = (topic: string) => MqttMessageEventBus.$off(topic, id)

    React.useEffect(() => {
        if (mqtt?.connected && isReady && enable) {
            subscribe();
        }
    }, [mqtt?.connected, isReady, enable]);

    React.useEffect(() => {
        return () => {
            unSubscribe();
        }
    }, [])

    React.useEffect(() => {
        if (errors.length)
            onError?.(errors)
    }, [errors, onError])

    React.useEffect(() => {
        if (cacheFirst && status === "subscribed" && !response.payload) {
            const topic = mutableStore.current.topic
            const cacheItem = getCache(topic, false)
            setResponse({
                payload: (cacheItem?.payload as TSubscriptionResponse<K>["payload"]) || null,
                updatedAt: cacheItem?.time || null
            })
        }
    }, [status])

    const subscribe = () => {
        deferredPromise.current = new Deferred<ISubscriptionGrant[]>();
        try {
            const topic = fill(pattern as string, (params as any) || {})
            if (!validation.result && validation.messages.length)
                throw validation.messages

            if (!isReady)
                throw "ReactMqtt: Subscription in MQTT is not yet ready."
            if (status === "subscribed")
                return

            mqtt?.subscribe(topic, options, (err, granted) => {
                if (err) {
                    onSubscribeError?.(err);
                    deferredPromise.current?.reject(err);
                    setStatus('error')
                } else {
                    setTopic(topic)
                    onSubscribeSuccess?.(granted);
                    deferredPromise.current?.resolve(granted);
                    setStatus("subscribed")
                    listen(topic)
                }
            });
        } catch (e) {
            console.error(e)
            setErrors(prevState => {
                let error;
                if (Array.isArray(e))
                    error = [...prevState, ...e]
                else
                    error = [...prevState, e]
                return [...new Set(error)]
            })
            setStatus('error')
            deferredPromise.current?.reject(e)
        }
        return deferredPromise.current;
    };

    const unSubscribe = async () => {
        try {
            const topic = mutableStore.current.topic
            const listeners = MqttMessageEventBus.getListeners(topic)

            if (listeners[id] && Object.keys(listeners).length <= 1) {
                await unSubscribeTopic({topic, options: unSubscribeOptions}, )
            }
            setStatus("unSubscribed")
            unListen(topic)
            onUnSubscribe?.()
        } catch (e) {
            console.log(e)
        }

    };

    const clb = (payload: ArrayBuffer) => {
        if (mutableStore.current?.status !== "unSubscribed") {
            const topic = mutableStore.current.topic
            const cache: Cache = new Cache()
            const updatedAt = new Date()
            cache.setCache(topic, {
                topic,
                time: updatedAt,
                payload
            })
            const data = JSON.parse(payload.toString() || "{}");
            setResponse({
                payload: data,
                updatedAt,
            });
            onMessage?.(data);
        }
    }

    return {
        subscribe,
        unSubscribe,
        payload: response.payload,
        dataUpdatedAt: response.updatedAt,
        isReady,
        status,
        errors,
        topic: mutableStore.current.topic,
        id
    };
}
