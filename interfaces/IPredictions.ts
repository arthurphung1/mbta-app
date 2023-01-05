export interface IPrediction {
    attributes: Attributes,
    id: string,
    relationships: Relationships,
    type: string
}

interface Attributes {
    arrival_time: string,
    departure_time: string,
    direction_id: number,
    schedule_relationship: string,
    status: string,
    stop_sequence: number
}

interface Data {
    id: string,
    type: string
}

interface Relationships {
    route: Data,
    stop: Data,
    trip: Data,
    vehicle: Data
}