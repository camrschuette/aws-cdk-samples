//#region Client-facing
export interface Event {
    readonly id: string
    readonly scheduledDate: Date
    //readonly activity: Activity
    readonly participants: Participant[]
}

export interface Activity {
    readonly description: string
    readonly price: number
}

export interface Participant {
    readonly firstName: string
    readonly lastName: string
    readonly age: number
}
//#endregion

export interface ApplicationError {
    readonly message: string
    readonly property?: string
}
