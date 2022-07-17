import { z } from 'zod';

export const GetEventPathParameters = z.object({
    id: z.string().length(32, 'Invalid event identifier')
}).strict();
