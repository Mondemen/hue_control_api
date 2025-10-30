import { BridgeHomeGet } from "./bridge_home";
import { ArcheType } from "./resource";

export interface RoomGet extends BridgeHomeGet
{
	type: "room",
	metadata:
	{
		/** Human readable name of a resource */
		name: string,
		/** Possible archetypes of a room */
		archetype: ArcheType,
	}
}

export interface RoomSet
{
	children?: RoomGet["children"],
	metadata?: Partial<RoomGet["metadata"]>
}

export type RoomCreate = Pick<RoomGet, "children" | "metadata">;
