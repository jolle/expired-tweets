export enum CheckResult {
    ERROR = 'error',
    WARNING = 'warning',
    NOTHING = 'nothing'
}

export abstract class Provider {
    abstract checkURL(
        url: string
    ): Promise<{ message?: string; result: CheckResult }>;
}
