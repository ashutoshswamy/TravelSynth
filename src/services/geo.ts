/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents information about a destination.
 */
export interface Destination {
  /**
   * The name of the destination.
   */
  name: string;
  /**
   * The location of the destination.
   */
  location: Location;
}

/**
 * Asynchronously retrieves information about a given destination.
 *
 * @param destination The name of the destination to retrieve information for.
 * @returns A promise that resolves to a Destination object containing name and location.
 */
export async function getDestination(
  destination: string
): Promise<Destination> {
  // TODO: Implement this by calling an API.

  return {
    name: destination,
    location: {
      lat: 34.052235,
      lng: -118.243683,
    },
  };
}
