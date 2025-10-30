import Registry from "../Registry";
import Resource, { ResourceEvents } from "../Resource";
import Service from "../service";
import { DeviceGet, DeviceSet } from "../types/device";
import { ArcheType, PartialResource, ResourceIdentifier } from "../types/resource";
import Accessory from "./Accessory";
import Bridge from "./Bridge";
import ContactSensor from "./ContactSensor";
import DialSwitch from "./DialSwitch";
import DimmerSwitch from "./DimmerSwitch";
import Light from "./Light";
import MotionSensor from "./MotionSensor";
import SmartButton from "./SmartButton";
import WallSwitch from "./WallSwitch";

export interface DeviceByType
{
	"device": Device,
	"bridge": Bridge,
	"light": Light,
	"accessory": Accessory,
	"wall_switch": WallSwitch,
	"smart_button": SmartButton,
	"dial_switch": DialSwitch,
	"dimmer_switch": DimmerSwitch,
	"motion_sensor": MotionSensor,
	"contact_sensor": ContactSensor
}

export type DeviceType = keyof DeviceByType;

export interface DeviceEvents extends ResourceEvents
{
	name: (name: string) => void;
	archetype: (archetype: ArcheType) => void;
	service_added: (service?: Service) => void;
	service_deleted: (service: ResourceIdentifier) => void;
}

export default class Device extends Resource
{
	private extended: boolean;
	public deviceType: DeviceType = "device";

	declare protected toUpdate: DeviceSet;
	protected services: ResourceIdentifier[] = [];

	protected name: string;
	protected archetype: ArcheType;
	protected modelID?: string;
	protected manufacturerName?: string;
	protected productName?: string;
	protected productArchetype?: ArcheType;
	protected certified?: boolean;
	protected softwareVersion?: string;
	protected hardwarePlatformType?: string;

	constructor(registry: Registry)
	{
		super(registry);
		this.extended = new.target !== Device;
	}

	protected setData(data: PartialResource<DeviceGet>)
	{
		super.setData(data);
		if (data.metadata)
		{
			if (this.name !== data.metadata.name)
				this.emit("name", this.name = data.metadata.name);
			if (this.archetype !== data.metadata.archetype)
				this.emit("archetype", this.archetype = data.metadata.archetype);
		}
		if (data.product_data)
		{
			this.modelID = data.product_data.model_id;
			this.manufacturerName = data.product_data.manufacturer_name;
			this.productName = data.product_data.product_name;
			this.productArchetype = data.product_data.product_archetype;
			this.certified = data.product_data.certified;
			this.softwareVersion = data.product_data.software_version;
			this.hardwarePlatformType = data.product_data.hardware_platform_type;
		}
		if (data.services)
		{
			this.services.forEach(service =>
			{
				if (!data.services?.find(serviceRef => serviceRef.rid === service.rid && serviceRef.rtype === service.rtype))
					this.emit("service_deleted", service);
			})
			this.services = data.services.map(service =>
			{
				if (!this.services.find(serviceRef => serviceRef.rid === service.rid && serviceRef.rtype === service.rtype))
					this.emit("service_added", this.registry.resources[service.rtype]?.get(service.rid) as Service);
				return (service);
			});
		}
		if (!this.extended)
		{
			if (!this.init)
			{
				this.emit("created");
				this.init = true;
			}
			else
				this.emit("updated");

		}
	}

	emit<T extends keyof DeviceEvents>(eventName: T, ...args: Parameters<DeviceEvents[T]>) {super.emit<any>(eventName, ...args)}
	on<T extends keyof DeviceEvents>(eventName: T, listener: DeviceEvents[T]) {return (super.on<any>(eventName, listener))}
	once<T extends keyof DeviceEvents>(eventName: T, listener: DeviceEvents[T]) {return (super.once<any>(eventName, listener))}
	off<T extends keyof DeviceEvents>(eventName: T, listener: DeviceEvents[T]) {super.off<any>(eventName, listener)}
	removeAllListeners<T extends keyof DeviceEvents>(eventName: T) {super.removeAllListeners<any>(eventName)}

	get zigbeeConnectivityService()
	{return (this.services.find(ref => ref.rtype === "zigbee_connectivity") as ResourceIdentifier<"zigbee_connectivity"> | undefined)}

	get zgpConnectivityService()
	{return (this.services.find(ref => ref.rtype === "zgp_connectivity") as ResourceIdentifier<"zgp_connectivity"> | undefined)}

	get deviceSoftwareUpdateService()
	{return (this.services.find(ref => ref.rtype === "device_software_update") as ResourceIdentifier<"device_software_update"> | undefined)}

	getZigbeeConnectivityService()
	{
		const zigbeeConnectivityService = this.zigbeeConnectivityService;

		return (zigbeeConnectivityService && this.registry.resources.zigbee_connectivity.get(zigbeeConnectivityService.rid));
	}

	getZgpConnectivityService()
	{
		const zgpConnectivityService = this.zgpConnectivityService;

		return (zgpConnectivityService && this.registry.resources.zgp_connectivity.get(zgpConnectivityService.rid));
	}

	getDeviceSoftwareUpdateService()
	{
		const deviceSoftwareUpdateService = this.deviceSoftwareUpdateService;

		return (deviceSoftwareUpdateService && this.registry.resources.device_software_update.get(deviceSoftwareUpdateService.rid));
	}

	getServices()
	{return (this.services.map(ref => this.registry.resources[ref.rtype]?.get(ref.rid)).filter(Boolean) as Service[])}

	getName()
	{return (this.name)}

	setName(name: string)
	{
		this.toUpdate.metadata ??= {};
		this.toUpdate.metadata.name = name;
		this.updatable = true;
		return (this);
	}

	getArchetype()
	{return (this.archetype)}

	setArchetype(archetype: ArcheType)
	{
		this.toUpdate.metadata ??= {};
		this.toUpdate.metadata.archetype = archetype;
		this.updatable = true;
		return (this);
	}

	getConnectivityStatus()
	{return ((this.getZgpConnectivityService() ?? this.getZigbeeConnectivityService())?.getStatus())}

	getMacAddress()
	{return (this.getZigbeeConnectivityService()?.getMacAddress())}

	getUpdateState()
	{return (this.getDeviceSoftwareUpdateService()?.getState())}

	getUpdateProblems()
	{return (this.getDeviceSoftwareUpdateService()?.getProblems())}
}
