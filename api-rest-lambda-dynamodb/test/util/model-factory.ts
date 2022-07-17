import { faker } from '@faker-js/faker';
import merge = require('lodash.merge');
import {Activity, Event, Participant} from '../../app/shared/models';

export abstract class ModelFactory {
    public static event(overrides?: Partial<Event>): Event {
        return merge({}, {
            id: faker.datatype.uuid(),
            scheduledDate: faker.date.past(),
            activity: ModelFactory.activity(),
            participants: [ ModelFactory.participant() ]
        }, overrides);
    }

    public static activity(overrides?: Partial<Activity>): Activity {
        return merge({}, {
            description: faker.random.words(),
            price: faker.datatype.float()
        }, overrides);
    }

    public static participant(overrides?: Partial<Participant>): Participant {
        return merge({}, {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            age: faker.datatype.number({min: 0, max: 100})
        }, overrides);
    }
}
