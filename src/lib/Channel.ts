import EntertainmentConfiguration from "../api/EntertainmentConfiguration";
import Registry from "../api/Registry";
import EntertainmentService from "../api/service/EntertainmentService";
import { EntertainmentChannel, EntertainmentChannelMember, EntertainmentChannelPosition } from "../api/types/entertainment_configuration";
import ExtError from "./error";

export default class Channel
{
	private registry: Registry;
	private parent: EntertainmentConfiguration;

	private id: number;
	private position: EntertainmentChannelPosition;
	members: EntertainmentChannelMember[];

	constructor(registry: Registry, parent: EntertainmentConfiguration)
	{
		this.registry = registry;
		this.parent = parent;
	}

	static setData(channel?: Channel, data?: EntertainmentChannel)
	{
		if (data)
			channel?.setData(data);
	}

	private setData(data: EntertainmentChannel)
	{
		if (typeof data.channel_id === "number" && this.id !== data.channel_id)
			this.id = data.channel_id;
		if (data.position)
			this.position = data.position;
		if (data.members)
			this.members = data.members;
	}

	getID()
	{return (this.id)}

	getPosition()
	{return (this.position)}

	getMembers()
	{return (this.members.map(member => ({service: this.registry.resources.entertainment.get(member.service.rid), index: member.index})).filter(Boolean) as EntertainmentChannelMember<EntertainmentService>[])}

	getService()
	{
		const id = this.members.at(0)?.service.rid;

		if (id && this.registry.resources.entertainment.has(id))
			return (this.registry.resources.entertainment.get(id) as EntertainmentService);
		throw new ExtError("Entertainment service must exist but not found in bridge");
	}
}