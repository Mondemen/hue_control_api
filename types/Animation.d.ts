import { LightStreamInternal } from "../src/api/device/LightStream";
import { ColorValue } from "../src/lib/Color";

type Duration =
	| `${number}ms`
	| `${number}s`
	| `${number}min`
	| `${number}h`
	| `${number}d`
	| `${number}s ${number}ms`
	| `${number}min ${number}s`
	| `${number}min ${number}ms`
	| `${number}h ${number}min`
	| `${number}h ${number}s`
	| `${number}d ${number}h`
	| `${number}d ${number}min`
	| `${number}h ${number}min ${number}s`
	| `${number}h ${number}min ${number}s ${number}ms`
	| `${number}d ${number}h ${number}min ${number}s`
	| `${number}d ${number}h ${number}min ${number}s ${number}ms`
	| `${number}d ${number}h ${number}min`;

export type TransitionFunction = "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";

export interface AnimationModifierConfig
{
	onBegin?: () => void,
	onEnd?: () => void
}

export type AnimationConfig = AnimationModifierConfig;

//#region Modifier configs

interface Transitionnable
{
	transitionFunction?: TransitionFunction | [number, number, number, number]
}

export interface AnimationModifierBrightnessConfig extends AnimationModifierConfig, Transitionnable
{
	brightness: number | [number, number, ...number[]],
}

export interface AnimationModifierBrightnessPaletteConfig extends AnimationModifierConfig, Transitionnable
{
	brightness: [number, number, ...number[]],
	transition: number | Duration
}

export interface AnimationModifierColorConfig extends AnimationModifierConfig, Transitionnable
{
	color: ColorValue | [ColorValue, ColorValue, ...ColorValue[]],
}

export interface AnimationModifierColorPaletteConfig extends AnimationModifierConfig, Transitionnable
{
	color: [ColorValue, ColorValue, ...ColorValue[]],
	transition: number | Duration
}

export interface AnimationModifierFlickerConfig extends AnimationModifierConfig
{
	intensity?: number,
	min?: number,
	max?: number
}

export interface AnimationModifierLightningConfig extends AnimationModifierConfig
{
	max?: number
}

export interface AnimationModifierWaveConfig extends AnimationModifierConfig
{
	frequency?: number,
	min?: number,
	max?: number
}
//#endregion Modifier configs

export interface AnimationModifier
{
	start(light: LightStreamInternal, frame: number, totalFrame: number, framesPerSecond: number): void;
}

//#region Brightness modifiers
export interface AnimationModifierBrightness extends AnimationModifier
{
	type: "brightness"
}

export type AnimationModifierFlicker = AnimationModifierBrightness;
export type AnimationModifierLightning = AnimationModifierBrightness;
export type AnimationModifierWave = AnimationModifierBrightness;
//#endregion Brightness modifiers

//#region Color modifiers
export interface AnimationModifierColor extends AnimationModifier
{
	type: "color"
}

export type AnimationModifierPalette = AnimationModifierColor;
//#endregion Color modifiers

export interface AnimationTimingConfig extends AnimationConfig
{
	brightness?: number | [number, number, ...number[]] | AnimationModifierBrightness,
	color?: ColorValue | [ColorValue, ColorValue, ...ColorValue[]] | AnimationModifierColor,
	duration: number | Duration | {min: number | Duration, max: number | Duration},
	loop?: number | {min: number, max: number}
}

export interface TimingAnimation
{
	frames: (light: LightStreamInternal, id: string, framesPerSecond: number) => number
	start(light: LightStreamInternal, id: string, frame: number, totalFrame: number, framesPerSecond: number): void;
}

export interface SequenceAnimation
{
	start(light: LightStreamInternal, frame: number, framesPerSecond?: number): void;
}
