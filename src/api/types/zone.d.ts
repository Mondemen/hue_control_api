import { BridgeHomeGet } from "./bridge_home";
import { ArcheType } from "./resource";

export interface ZoneGet extends BridgeHomeGet
{
	type: "zone",
	metadata:
	{
		/** Human readable name of a resource */
		name: string,
		/** Possible archetypes of a room */
		archetype: ArcheType,
	}
}

export interface ZoneSet
{
	children?: ZoneGet["children"],
	metadata?: Partial<ZoneGet["metadata"]>
}

export type ZoneCreate = Pick<ZoneGet, "children" | "metadata">;
