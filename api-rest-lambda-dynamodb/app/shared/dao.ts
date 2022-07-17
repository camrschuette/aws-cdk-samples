import {z} from 'zod';

//#region Database
const parsePk = z.string()
    .regex(/EVENT#\w{32}/)
    .transform((pk) => pk.split('#')[1]);

const parseParticipantSk = z.string()
    .regex(/PARTICIPANT#\w+#\w+/)
    .transform((sk) => sk.split('PARTICIPANT#')[1]);

export const DbEventSchema = z.object({
    pk: parsePk, // EVENT#uuid
    sk: z.string().regex(/PROFILE/), // PROFILE
    key: z.string().min(1), // Bored API activity key
    scheduledDate: z.date() // ISO 8601 YYYY-MM-DDTHH:MM:SSZ
}).strict();

export const DbParticipantSchema = z.object({
    pk: parsePk, // EVENT#uuid
    sk: parseParticipantSk, // PARTICIPANT#first#last
    age: z.number().int()
}).strict();
//#endregion
