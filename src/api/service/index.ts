import Resource, { ResourceEvents } from "../Resource";
import { PartialResource, ResourceIdentifier } from "../types/resource";
import { ServiceGet } from "../types/service";

export type ServiceEvents = ResourceEvents;

export default abstract class Service extends Resource
{
	owner: ResourceIdentifier;

	protected setData(data: PartialResource<ServiceGet>)
	{
		super.setData(data);
		if (data.owner && this.owner?.rid !== data.owner.rid && this.owner?.rtype !== data.owner.rtype)
			this.owner = data.owner;
	}

	getOwner()
	{return (this.registry.resources[this.owner.rtype]?.get(this.owner.rid) as Resource | undefined)}
}