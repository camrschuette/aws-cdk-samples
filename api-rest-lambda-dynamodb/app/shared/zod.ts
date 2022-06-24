import {z} from 'zod';
import {ApplicationError} from "./models";

/**
 * @param error
 */
export const isZodError = (error: unknown): boolean => error instanceof z.ZodError;

/**
 * @see {@link https://zod.dev/ERROR_HANDLING|Zod} for more info
 */
export const zodErrorHandler = (error: z.ZodError): { errors: ApplicationError[], status: number } => {
    const errors: ApplicationError[] = [];
    
    error.errors.forEach((issue) => {
        switch (issue.code) {
            case z.ZodIssueCode.invalid_type:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.invalid_literal:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.custom:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.invalid_union:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.invalid_union_discriminator:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.invalid_enum_value:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.unrecognized_keys:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.invalid_arguments:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.invalid_return_type:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.invalid_date:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.invalid_string:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.too_small:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.too_big:
                errors.push({
                    message: issue.message,
                    property: issue.path.join('.')
                });
                break;
            case z.ZodIssueCode.invalid_intersection_types:
                errors.push({ message: issue.message });
                break;
            case z.ZodIssueCode.not_multiple_of:
                errors.push({ message: issue.message });
                break;
        }
    });
    
    return { errors, status: 400 };
}
