import { z } from "zod";

//region Input request models
export const CreateEventRequestSchema = z.object({
    activityKey: z.string(),
    startDate: z.date(),
    participants: z.array(z.object({
        name: z.string(),
        age: z.number()
    })).nonempty()
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
//endregion

