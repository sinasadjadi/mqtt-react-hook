import {exec, fill, matches} from "mqtt-pattern";

export const validateTopic = (pattern: string, params: any): { result: boolean, messages: string[] } => {
    const topic = fill(pattern as string, (params as any) || {})
    const executed = exec(pattern as string, topic) || {};
    const emptyLists = Object.keys(executed).filter((key) => executed[key as keyof typeof executed] === "null" || executed[key as keyof typeof executed] === "undefined")
    const errorMessages = emptyLists.map(key => `ReactMqtt: The parameter "${key}" has not been provided.`)
    const valid = matches(pattern as string, topic);
    return {
        result: !errorMessages.length && valid,
        messages: errorMessages
    }
}
