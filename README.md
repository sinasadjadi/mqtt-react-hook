<br/>
<div align="center"> 
<h1 align="center">Mqtt React Hook</h1>
<h5 align="center">React + MQTT</h5>
<p align="center">
A powerful React library for simplify MQTT integration
<br/>
<br/>
<br/>
<br/>
 <a href="https://github.com/sinasadjadi/mqtt-react-hook/issues/new?labels=bug">Report Bug .</a>
  <a href="https://github.com/sinasadjadi/mqtt-react-hook/issues/new?labels=enhancement">Request Feature</a>
</p>
<br/>
<br/>
<br/>
</div>

## About The Project

If you have experience developing MQTT functionality within a React application, you may have encountered challenges
when managing a growing number of topics. As the number of topics increases, it becomes difficult to handle them
effectively.

**mqtt-react-hook** is a React library that offers multiple React hooks, designed to simplify the integration of MQTT
functionality within your React applications.

## Features

- **Type Safety and Embeded types**: mqtt-react-hook includes embedded type definitions to enhance your IDE experience and
  prevent errors like type coercion,
- **Caching**: There is a global caching mechanism that stores the last received message from the broker for each
  subscribed topic.
- **Rendering Optimization**: Efforts have been made to minimize the number of component re-renders as much as possible.
- **Using Mqtt Pattern**: Using patterns instead of fixed topics: This feature is often beneficial since MQTT topics
  typically involve dynamic parameters.

Follow the documentation for detailed instructions on implementing this features."

## Installation

   ```sh
   npm install mqtt-react-hook
   #or
   yarn add mqtt-react-hook
   ``` 

## Usage

1- To begin, ensure your main parent component are wrapped within the `ReactMqttContextProvider` context provider. This
enables each child component within it to access the provided hooks.

```tsx
import {ReactMqttContextProvider} from "mqtt-react-hook";

const App = () => {

    return (
        <ReactMqttContextProvider
            brokerUrl={"BROKER_URL"} //mqtt broker url 
        >
            //your components
        </ReactMqttContextProvider>
    )
}
export default App
```

2- use the hooks: `useMqttSubscribe` , `useMqttPublish`

```tsx
import {useMqttSubscribe, useMqttPublish} from "mqtt-react-hook";

const UserInfo = () => {

    const USERID = "46ead19a-98da-4790-9eac-73e5aa3f3e70"

    // to subscribe to a topic
    const {payload: user} = useMqttSubscribe({
        pattern: "USER_INFIO/+userId",
        params: {userId: USERID},
    })

    // to publish a topic
    const publishment = useMqttPublish({
        pattern: "GET_USER_INFO",
    })

    const getUserData = async () => {
        await publishment.publish({payload: {userId: USERID}})
        console.log("published")
    }

    return (
        <div>
            <button onClick={getUserData}>get user info</button>
            {Boolean(user.id) && (<div>{user.name}</div>)}
        </div>
    )
}

export default UserInfo
```

## API Reference

### `ReactMqttContextProvider`

A Context Provider is utilized to instantiate and initialize the MQTT instance object. Wrapping your main component
within this Context Provider is necessary to access the provided hooks.

#### available props:

* `brokerUrl: string`
    * **Required**
    * The broker url.
* `opts: string`
    * **Optional**
    * the MQTT client connection options.
    * <a href="https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientstreambuilder-options">visit this for more
      information.</a>
* `manualConnect: boolean`
    * **Optional**
    * Set this to `true` if you don't want your MQTT client to connect automatically after the initial render of your
      application. In this case, you must call the `reconnect` function manually whenever you want to connect to the
      MQTT broker. This option is useful when certain client options, such as credentials, are not yet ready during the
      initial render of your application.
    * defaults to `false`

#### returns:

* `mqtt: MqttClient | null`
    * the mqtt client object.
* `status: "online" | "offline" | "reconnecting" | "error"`
    * the status of mqtt client connection
* `reconnect: (url?: string, opts?: Omit<IClientOptions, "manualConnect">) => Promise<MqttClient | null>`
    * use this to reconnect the MQTT client to the broker.
 

### `useMqttSubscribe`

A hook for subscribing into a topic.

#### available props:

* `pattern: string`
    * **Required**
    * The MQTT topic pattern. `eg: device/+id`
* `params: Record<string, string>`
    * **Optional**
    * The dynamic params which exist on topic pattern.
    * For example, if your topic pattern is `device/+id/+name`, you must provide the following parameters
      to `useMqttSubscribe` to create your topic.
    * ``{id: "123", name: "sampleName"}``
  
    * This library uses `mqtt-pattern` to create topics. The topics are generated based on the pattern and params values
      passed as arguments.
    * <a href="https://github.com/RangerMauve/mqtt-pattern?tab=readme-ov-file#mqtt-pattern">mqtt-pattern</a>

* `options: IClientSubscribeOptions`
    * **Optional**
    * The options to subscribe with.
    * <a href="https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientsubscribetopictopic-arraytopic-object-options-callback">
      visit this link for more information.</a>
* `onSubscribeSuccess: (granted?: ISubscriptionGrant[]) => void`
    * **Optional**
    * A callback function that is called after successfully subscribing into a topic
* `onSubscribeError: (e: Error) => void`
    * **Optional**
    * A callback function called if there is an error in subscription
* `onMessage: (payload: any) => void`
    * **Optional**
    * A callback function that is called after MQTT client receives a message.
* `onUnSubscribe?: (error?: Error, packet?: Packet) => void`
    * **Optional**
    * A callback function that is invoked after the MQTT client unsubscribes from a topic.
* `unSubscribeOptions: IClientSubscribeOptions`
    * **Optional**
    * The options to unSubscribe with.
* `enable: boolean`
    * **Optional**
    * Set this to `false` to disable this subscription from automatically subscribed.
    * defaults to `true`
* `cacheFirst?: boolean`
    * **Optional**
    * To use the cached response of the topic as the initial value of the payload, if available.
    * defaults to `false`

#### returns:

* `payload: any`
    * The payload of the last received message.
* `subscribe: () => TSubscribeReturnType`
    * The method to manually subscribe to a topic.
* `unSubscribe: () => void`
    * The method to manually unsubscribe from a topic.
* `isReady: boolean`
    * a boolean flag that generally determines if the hook is ready to subscribe to the topic. This means that all
      values are provided inside `params` have value, and the hook has successfully created the topic from the pattern.
    * By default, if `isEnable` is true, the hook will subscribe to the topic when `isReady` becomes true.
* `status: "subscribed" | "unSubscribed" | "idle" | "error"`
    * the status of the subscription.
    * will be
        * `idle`: when any of `mqtt.connected`, `isEnable`, or `isReady` is `false`.
        * `subscribed`: hook successfully subscribed to topic
        * `unSubscribed`: When the hook has been unsubscribed from the provided topic. the action of unsubscription will
          occur in the following scenarios:
            * when component unmount.
            * when `unsubscribe` function returned by hook, will be called method.
            * When you manually call the `unSubscribeTopic` method in the `useMqttUtils` hook, it changes the status of
              all subscription hooks for the provided topic to `unSubscribed`.
        * `error`: If there are any errors in the subscription, the corresponding error property contains the error
          received.

* `errors: unknown[]`:
    * Errors occur when the hook attempts to subscribe.
* `topic: string | null`:
    * The generated topic based on the provided `pattern` and `params`.
* `id: string`
    * The unique ID of the hook.
* `dataUpdatedAt: Date | null`
    * The last time the hook received a message on the subscribed topic.
 
### `useMqttPublish`

A hook for publishing a message (payload) into a topic.

#### available props:

* `pattern: string`
    * **Required**
    * The MQTT topic pattern. `eg: device/+id`
* `params: Record<string, string>`
    * **Optional**
    * The dynamic params which exist on topic pattern.
    * For example, if your topic pattern is `device/+id/+name`, you must provide the following parameters
      to `useMqttPublish` to create your topic.
    * ``{id: "123", name: "sampleName"}``
    * This library uses `mqtt-pattern` to create topics. The topics are generated based on the pattern and params values
      passed as arguments.
    * <a href="https://github.com/RangerMauve/mqtt-pattern?tab=readme-ov-file#mqtt-pattern">mqtt-pattern</a>

#### returns:

* `isReady: boolean`
    * a boolean flag that generally determines if the hook is ready to publish message into the topic. This means that
      all values are provided inside `params` have value, and the hook has successfully created the topic from the
      pattern.
* `publish: (config: TPublishmentConfig) => Promise<Packet | undefined>;`
    * The publish function must be called whenever you want to publish to the provided topic.
    * Before calling this function, ensure that `isReady` is true.
    * the `config` params can have the following values
        * `payload: any`
            * **Optional**
            * The payload object to send in publishment.
        * `options: IClientPublishOptions`
            * **Optional**
            * The options of mqtt publish method
            * <a href="https://github.com/mqttjs/MQTT.js?tab=readme-ov-file#mqttclientpublishtopic-message-options-callback">
              visit this link for more information.</a>

        * `onPublishSuccess: (packet?: Packet) => void`
            * **Optional**
            * A callback method invoked after MQTT successfully publishes into the topic.
        * `onPublishError: (e: Error) => void`
            * **Optional**
            * A callback method invoked after any errors occur during publishment.
    * The dynamic params which exist on topic pattern.
* `status: "publishing" | "published" | "error" | "idle"`
    * The status of the hook.
    * Will be
        * `idle`: when the `publish` method has not been called yet.
        * `published`: When the hook successfully publishes the message to the topic.
        * `publishing`: When the hook is attempting to publish the message.
        * `error`: If there is an error in publishment, the corresponding error property contains the error received.
* `errors: unknown[]`
    * Errors occur when the hook attempts to publish the message.
* `topic: string | null`
    * The generated topic based on the provided `pattern` and `params`.
 
### `useMqttUtils`

A hook that returns several useful utilities.

#### returns:

* `unSubscribeTopic: ({ topic: string, options?: IClientSubscribeOptions }) => void`
    * A function to force all subscription of the provided topic unsubscribe.
    * Note: Generally, the status of the subscription hooks change to `unSubscribed` when:
        * Component unmounts.
        * The `unSubscribe` function returned from `useMqttSubscription` is called.
        * When the `unSubscribeTopic` function is called, it will unsubscribe all subscriptions to the provided topic. 
* `getCache: (topic: string, buffer?: boolean) => undefined | TCacheItem`
    * ``type TCacheItem = { time: Date payload: ArrayBuffer | object topic: string }``
    * A function to get the available cache for the provided topic.
    * params:
        * `topic`
        * `buffer` Determines whether you want to receive the raw message (Buffer) or the converted version (Object).

* `deleteCache: (topic: string) => void`
* `clearCache: (topic: string) => void`

## TypeScript

**mqtt-react-hook** includes embedded type definitions to enhance your IDE experience and prevent errors like type coercion.

This is an optional feature that may impact compilation time depending on your project size. However, it's highly
recommended for developers using TypeScript to take advantage of the type enhancements it offers.

### Create a declaration file and export it

You can define your own types for topics
using [Type Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
and [Merging Interfaces](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)
in TypeScript. To begin, create a declaration file that exports a module named mqtt-react-hook.

```ts
export declare module "mqtt-react-hook" {
    interface IReactMqttPattern {
        "GET_DEVICE_INFO/+userId/+deviceId": {
            // define the param types
            params: { userId: string, deviceId: string }

            // Define the payload type.
            // In subscription, it is the expected received payload
            // In publications, it is the payload that must be published as a message.
            payload: { deviceId: string, version: number, isWork?: boolean }[]
        }
    }
}
```

Easy-peasy, that's it.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any
contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.

## Contact

Sina Sadjadi - [linkedin](https://www.linkedin.com/in/sinasadjadi) - [sinasadjadi@proton.me](mailto:sinasadjadi@proton.me)

Project Link: [https://github.com/sinasadjadi/mqtt-react-hook](https://github.com/sinasadjadi/reacqtt)


## Acknowledgments

* This project is a wrapper around [MQTT.js](https://github.com/mqttjs/MQTT.js) for React developers.
* [mqtt-pattern](https://github.com/RangerMauve/mqtt-pattern) is also used in this project.
