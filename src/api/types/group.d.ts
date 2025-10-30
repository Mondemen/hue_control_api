import { ResourceGet, ResourceIdentifier } from "./resource";

export interface GroupGet extends ResourceGet
{
	/** Child devices/services to group by the derived group */
	children: ResourceIdentifier[],
	/**
	 * References all services aggregating control and state of children in the group.
	 * This includes all services grouped in the group hierarchy given by child relation.
	 * This includes all services of a device grouped in the group hierarchy given by child relation
	 * Aggregation is per service type, ie every service type which can be grouped has a corresponding
	 * definition of grouped type.
	 *
	 * Supported types:
	 * * grouped_light
	 * * grouped_motion
	 * * grouped_light_level
	 */
	services: ResourceIdentifier[]
}