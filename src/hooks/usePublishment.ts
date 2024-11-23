import {useMemo, useRef, useState} from "react";
import {exec, fill, matches} from "mqtt-pattern";
import {Packet} from "mqtt";
import {useReactMqtt} from "@/context";
import {TPatterns} from "@/types";
import {
    TPublishmentConfig,
    TPublishmentParams,
    TPublishmentResponse,
    TPublishmentStatus,
    TPublishReturnType,
    TError
} from "@/types";
import Deferred from "@/utilize/DeferredPromise";

export default function useMqttPublish<K extends keyof TPatterns = any>({
                                                                            pattern,
                                                                            params,
                                                                        }: TPublishmentParams<K>): TPublishmentResponse<K> {
    const [status, setStatus] = useState<TPublishmentStatus>("idle")
    const [errors, setErrors] = useState<TError>([])

    const {mqtt} = useReactMqtt();
    const deferredPromise = useRef<TPublishReturnType>();

    const topic = fill(pattern as string, (params as any) || {});

    const isReady = useMemo<boolean>(() => {
        const executed = exec(pattern as string, topic) || {};
        const valid = matches(pattern as string, topic);
        return !!mqtt?.connected &&
            valid &&
            !Object.values(executed).some(
                (param) => param === "null" || param === "undefined",
            )
    }, [mqtt?.connected, topic]);

    const publish = ({payload = {}, onPublishSuccess, onPublishError, options, onError}: TPublishmentConfig) => {
        deferredPromise.current = new Deferred();
        try {
            if (!isReady)
                throw "ReactMqtt: Subscription in MQTT is not yet ready."

            setStatus("publishing")
            mqtt?.publish(topic, JSON.stringify(payload), options, (error?: Error, packet?: Packet) => {
                if (error) {
                    setStatus('error')
                    onPublishError?.(error);
                    deferredPromise.current?.reject(error);
                } else {
                    setStatus("published")
                    onPublishSuccess?.(packet);
                    deferredPromise.current?.resolve(packet);
                }
            });
        } catch (e: unknown) {
            setStatus('error')
            onError?.(e)
            setErrors(prevState => {
                let error;
                if (Array.isArray(e))
                    error = [...prevState, ...e]
                else
                    error = [...prevState, e]
                return [...new Set(error)]
            })
        }
        return deferredPromise.current
    };

    return {isReady, publish, status, topic, errors};
}
