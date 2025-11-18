export type NPResponseType<T> = {
    success: boolean;
    data: T[];
    errors: string[];
    warnings: string[];
    info: string[];
    messageCodes: string[];
    errorCodes: string[];
    warningCodes: string[];
    infoCodes: string[];
};
