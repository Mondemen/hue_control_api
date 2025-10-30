import Resource, { ResourceEvents } from "../Resource";
import Service from "../service";
import { GroupGet } from "../types/group";
import { PartialResource, ResourceIdentifier } from "../types/resource";

export interface GroupEvents extends ResourceEvents
{
	child_added: (child?: Resource) => void;
	child_deleted: (child: ResourceIdentifier) => void;
	service_added: (service?: Service) => void;
	service_deleted: (service: ResourceIdentifier) => void;
}

export default abstract class Group extends Resource
{
	children: ResourceIdentifier[] = [];
	service: ResourceIdentifier[] = [];

	protected setData(data: PartialResource<GroupGet>)
	{
		super.setData(data);
		if (data.children)
		{
			this.children.forEach(child =>
			{
				if (!data.children?.find(childRef => childRef.rid === child.rid && childRef.rtype === child.rtype))
					this.emit("child_deleted", child);
			})
			this.children = data.children.map(child =>
			{
				if (!this.children.find(childRef => childRef.rid === child.rid && childRef.rtype === child.rtype))
					this.emit("child_added", this.registry.resources[child.rtype]?.get(child.rid));
				return (child);
			});
		}
		if (data.services)
		{
			this.service.forEach(service =>
			{
				if (!data.services?.find(serviceRef => serviceRef.rid === service.rid && serviceRef.rtype === service.rtype))
					this.emit("service_deleted", service);
			})
			this.service = data.services.map(service =>
			{
				if (!this.service.find(serviceRef => serviceRef.rid === service.rid && serviceRef.rtype === service.rtype))
					this.emit("service_added", this.registry.resources[service.rtype]?.get(service.rid) as Service);
				return (service);
			});
		}
	}

	emit<T extends keyof GroupEvents>(eventName: T, ...args: Parameters<GroupEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof GroupEvents>(eventName: T, listener: GroupEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof GroupEvents>(eventName: T, listener: GroupEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof GroupEvents>(eventName: T, listener: GroupEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof GroupEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	get groupedLightService()
	{return ((this.service as ResourceIdentifier<"grouped_light">[]).find(ref => ref.rtype === "grouped_light"))}

	get groupedLightLevelService()
	{return ((this.service as ResourceIdentifier<"grouped_light_level">[]).find(ref => ref.rtype === "grouped_light_level"))}

	get groupedMotionService()
	{return ((this.service as ResourceIdentifier<"grouped_motion">[]).find(ref => ref.rtype === "grouped_motion"))}

	getGroupedLight()
	{
		const groupedLight = this.groupedLightService;

		return (groupedLight && this.registry.resources.grouped_light.get(groupedLight.rid));
	}

	getGroupedLightLevel()
	{
		const groupedLightLevel = this.groupedLightLevelService;

		return (groupedLightLevel && this.registry.resources.grouped_light_level.get(groupedLightLevel.rid));
	}

	getGroupedMotion()
	{
		const groupedMotion = this.groupedMotionService;

		return (groupedMotion && this.registry.resources.grouped_motion.get(groupedMotion.rid));
	}
}