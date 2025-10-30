import { ResourceGet, ResourceIdentifier } from "./resource";

export interface ServiceGet extends ResourceGet
{
	/** Owner of the service, in case the owner service is deleted, the service also gets deleted */
	owner?: ResourceIdentifier
}