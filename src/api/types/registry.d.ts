
export interface HueBridgeAccess
{
	/** Hue bridge ID */
	bridgeID?: string,
	/** Hue bridge application key */
	appKey: string,
	/** Hue bridge client key (used for entertainment API) */
	clientKey?: string
}

export interface HueBridgeRemoteAccess
{
	clientID: string,
	clientSecret: string
	accessToken: string,
	refreshToken: string;
	expiresAt: Date;
	tokenType: string
}

export interface HueBridgeDiscovered
{
	id: string,
	internalipaddress: string,
	port: number
}