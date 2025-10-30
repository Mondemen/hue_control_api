import { ServiceGet } from "./service";

export type SoftwareUpdateState = "no_update" | "update_pending" | "ready_to_install" | "installing";

export interface DeviceSoftwareUpdateGet extends ServiceGet
{
	type: "device_software_update",
	/**
	 * * no_update – No software update available known for the device
	 * * update_pending – There is an update pending but not ready to install. (means the update is known, but transfer has not started or completed)
	 * * ready_to_install – The update is ready to be installed.
	 * * installing – The update is being installed.
	 */
	state: SoftwareUpdateState,
	problems: any[]
}