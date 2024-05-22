import React, {useState} from "react";
import mqtt from "mqtt"
import {TContextProviderProps, TContextReturnData} from "@/types"
import {MqttMessageEventBus} from "@/context/MqttEventBus";

const ReactMqttContext = React.createContext<TContextReturnData>({} as TContextReturnData);

export const useReactMqtt = () => {
    return React.useContext(ReactMqttContext);
};

export function ReactMqttContextProvider({
                                             children,
                                             brokerUrl,
                                             opts = {},
                                             manualConnect = false
                                         }: TContextProviderProps) {

    const [mqttClient, setMqttClient] = React.useState<TContextReturnData["mqtt"]>(null)
    const [status, setStatus] = useState<TContextReturnData["status"]>("offline")

    const initialize = async (
        url: TContextProviderProps["brokerUrl"] = brokerUrl,
        options: TContextProviderProps["opts"] = opts
    ) => {
        try {
            const client = await mqtt.connectAsync(url, {...options, manualConnect: false})
            setMqttClient(client)
            setStatus("online")
            return client
        } catch (error) {
            console.error("mqtt error in connecting", error);
            setStatus("error")
            throw error
        }
    };

    React.useEffect(() => {
        (async () => {
            if (!mqttClient && brokerUrl && !manualConnect) {
                await initialize();
            }
        })()
    }, [brokerUrl, opts, mqttClient]);

    React.useEffect(() => {
        if (mqttClient?.connected)
            mqttClient?.on("message", (topic, payload) => MqttMessageEventBus.$emit(topic, payload))
    }, [mqttClient?.connected])

    React.useEffect(() => {
        mqttClient?.on('offline', () => {
            console.log("offline")
            setStatus("offline")
        });
        mqttClient?.on('connect', () => {
            console.log("connect")
            setStatus('online');
        });
        mqttClient?.on('reconnect', () => {
            console.log("reconnecting")

            setStatus("reconnecting")
        });
        mqttClient?.on('error', () => {
            console.log("error")
            setStatus("error")
        });
        mqttClient?.on('end', () => {
            console.log("end")
            setStatus("offline")
        });
        if (mqttClient)
            return () => {
                console.log("mqtt disconnected")
                mqttClient?.end(true);
            };
    }, [mqttClient]);

    return (
        <ReactMqttContext.Provider
            value={{
                mqtt: mqttClient,
                reconnect: initialize,
                status
            }}
        >
            {children}
        </ReactMqttContext.Provider>
    );
}


