import { Address } from '@/types';

export const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    street: '123 Market Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    latitude: 37.7749,
    longitude: -122.4194,
    instructions: 'Ring doorbell twice',
  },
  {
    id: 'addr-2',
    label: 'Work',
    street: '456 Mission Street, Floor 10',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    latitude: 37.7899,
    longitude: -122.3974,
    instructions: 'Leave with reception',
  },
];
