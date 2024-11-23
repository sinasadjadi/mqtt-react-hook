import Deferred from "@/utilize/DeferredPromise";
import {MqttClient, IClientPublishOptions, IClientSubscribeOptions, ISubscriptionGrant, IClientOptions} from "mqtt";
import {Packet} from "mqtt-packet";
import Cache from "@/store/cache";
import React from "react";
import {IPattern} from 'mqtt-react-hook'

type UseIfExist<T, K> = K extends keyof T ? T[K] : never;
type TMQttBasic = Record<string, { params?: object; payload?: object }>

type TParams<K extends keyof TPatterns = any> = keyof IPattern extends never ? {
    params?: UseIfExist<TPatterns[K], "params">
} : UseIfExist<TPatterns[K], "params"> extends never ? {
    params?: UseIfExist<TPatterns[K], "params">
} : { params: UseIfExist<TPatterns[K], "params"> }

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type TPatterns = keyof IPattern extends never ? TMQttBasic : IPattern

export type TCacheItem = {
    time: Date
    payload: ArrayBuffer | object
    topic: string
}

export type TCaches = Map<string, TCacheItem>

export type TSubscribeReturnType = Deferred<ISubscriptionGrant[] | undefined> | undefined

export type TSubscriptionStatus = "subscribed" | "unSubscribed" | "idle" | "error"

export type TPublishReturnType = Deferred<Packet | undefined>

export type TPublishmentStatus = "publishing" | "published" | "error" | "idle"

export type TError = unknown[]

export type TSubscriptionParams<K extends keyof TPatterns = any> = TParams<K> & {
    pattern: K;
    onSubscribeSuccess?: (granted?: ISubscriptionGrant[]) => void;
    onSubscribeError?: (e: Error) => void;
    onError?: (e: TError) => void;
    onMessage?: (payload: UseIfExist<TPatterns[K], "payload">) => void;
    onUnSubscribe?: () => void;
    options?: IClientSubscribeOptions;
    unSubscribeOptions?: IClientSubscribeOptions
    enable?: boolean;
    cacheFirst?: boolean
};

export type TSubscriptionResponse<K extends keyof TPatterns = any> = {
    payload: UseIfExist<TPatterns[K], "payload"> | null;
    subscribe: () => TSubscribeReturnType;
    unSubscribe: () => void;
    isReady: boolean;
    status: TSubscriptionStatus
    errors: TError
    topic: string | null
    id: string,
    dataUpdatedAt?: Date | null
};

export type TUtilsResponse = {
    unSubscribeTopic: (params: TUnSubscribedTopicParams) => void
    // mqttClient: MqttClient | null,
    getCache: (topic: string, buffer?: boolean) => undefined | TCacheItem,
    deleteCache: (topic: string) => ReturnType<Cache["deleteCache"]>
    clearCache: (topic: string) => ReturnType<Cache["clearCache"]>
}

export type TPublishmentParams<K extends keyof TPatterns = any> = TParams<K> & {
    pattern: K;
};

export type TPublishmentConfig<K extends keyof TPatterns = any> = {
    payload: UseIfExist<TPatterns[K], "payload">
    options?: IClientPublishOptions;
    onPublishSuccess?: (packet?: Packet) => void;
    onPublishError?: (e: Error) => void;
    onError?: (e: unknown) => void;
};

export type TPublishmentResponse<K extends keyof TPatterns = any> = {
    isReady: boolean;
    publish: (config: TPublishmentConfig<K>) => TPublishReturnType;
    status: TPublishmentStatus
    errors: TError
    topic: string
};

export type TUnSubscribedTopicParams = {
    topic: string,
    options?: IClientSubscribeOptions
}

export type TContextProviderProps = {
    children: React.ReactNode
    brokerUrl: string,
    opts?: Omit<IClientOptions, "manualConnect">,
    manualConnect?: boolean
}

export type TContextReturnData = {
    mqtt: MqttClient | null,
    reconnect: (url?: TContextProviderProps["brokerUrl"], opts?: TContextProviderProps["opts"]) => Promise<MqttClient | null>
    status: "online" | "offline" | "reconnecting" | "error"
};


