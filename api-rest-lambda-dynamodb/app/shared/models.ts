//#region Database
export interface DbEvent {
    readonly pk: string // #EVENT#uuid
    readonly sk: number // #DATE#ksuid
}

export interface DbParticipant {
    readonly pk: string // #PARTICIPANT#first#last
    readonly sk: string // #EVENT#uuid
    readonly age: number
}
//#endregion

//#region Client-facing
export interface Event {
    readonly id: string
    readonly date: Date
    readonly participants: Participant[]
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
