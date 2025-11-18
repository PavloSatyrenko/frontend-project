import { NPModels } from "./NPModels";

export type NPRequestType<M extends keyof NPModels, Method extends keyof NPModels[M]> = {
    apiKey: string;
    modelName: M;
    calledMethod: Method;
    methodProperties: NPModels[M][Method];
};
