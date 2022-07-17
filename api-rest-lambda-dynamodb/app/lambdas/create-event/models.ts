import { z } from 'zod';

//region Input request models
export const CreateEventRequestSchema = z.object({
    activityKey: z.number().int(),
    startDate: z.date(),
    participants: z.array(z.object({
        firstName: z.string(),
        lastName: z.string(),
        age: z.number().int()
    })).nonempty()
}).strict();
//endregion

