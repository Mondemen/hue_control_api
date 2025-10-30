import { array, boolean, number, object, ObjectSchema, string } from "yup";
import { EffectType } from "../types/capability/effect_v2";
import { SceneCreate, SceneSetNoRecall } from "../types/scene";
import { colorCreate, resourceIdentifier } from "./resource";

export const sceneCreate: ObjectSchema<SceneCreate> = object(
{
	metadata: object(
	{
		name: string().min(1).max(32).required(),
		image: resourceIdentifier(["public_image"]).default(undefined),
		appdata: string().min(1).max(16)
	}).required(),
	group: resourceIdentifier(["room", "zone"]).required(),
	actions: array(object(
	{
		target: resourceIdentifier(["light"]).required(),
		action: object(
		{
			on: object({on: boolean().required()}).default(undefined),
			dimming: object({brightness: number().max(100).required()}).default(undefined),
			color: colorCreate.default(undefined),
			color_temperature: object({mirek: number().min(153).max(500).required()}).default(undefined),
			effects: object({effect: string().oneOf<EffectType>(["no_effect", "candle", "fire", "prism", "sparkle", "opal", "glisten", "underwater", "cosmos", "sunbeam", "enchant"]).required()}).default(undefined),
			effects_v2: object(
			{
				action: object(
				{
					effect: string().oneOf<EffectType>(["no_effect", "candle", "fire", "prism", "sparkle", "opal", "glisten", "underwater", "cosmos", "sunbeam", "enchant"]).required(),
					parameters: object(
					{
						color: colorCreate,
						color_temperature: object({mirek: number().min(153).max(500).required()}),
						speed: number().required()
					})
				})
			}).default(undefined),
			dynamics: object({duration: number()}).default(undefined),
		}).required()
	}).required()).required(),
	palette: object(
	{
		color: array(object(
		{
			color: colorCreate.required(),
			dimming: object({brightness: number().max(100).required()}).required()
		})).max(9).required(),
		color_temperature: array(object(
		{
			color_temperature: object({mirek: number().min(153).max(500).required()}).required(),
			dimming: object({brightness: number().max(100).required()}).required()
		})).max(1).required(),
		dimming: array(object(
		{
			brightness: number().max(100).required()
		})).max(1).required(),
	}).default(undefined),
	speed: number().min(0).max(1),
	auto_dynamic: boolean()
});

export const sceneUpdate: ObjectSchema<SceneSetNoRecall> = object(
{
	metadata: object(
	{
		name: string().min(1).max(32),
		appdata: string().min(1).max(16)
	}),
	actions: array(object(
	{
		target: resourceIdentifier(["light"]).required(),
		action: object(
		{
			on: object({on: boolean().required()}).default(undefined),
			dimming: object({brightness: number().max(100).required()}).default(undefined),
			color: colorCreate.default(undefined),
			color_temperature: object({mirek: number().min(153).max(500).required()}).default(undefined),
			effects: object({effect: string().oneOf<EffectType>(["no_effect", "candle", "fire", "prism", "sparkle", "opal", "glisten", "underwater", "cosmos", "sunbeam", "enchant"]).required()}).default(undefined),
			effects_v2: object(
			{
				action: object(
				{
					effect: string().oneOf<EffectType>(["no_effect", "candle", "fire", "prism", "sparkle", "opal", "glisten", "underwater", "cosmos", "sunbeam", "enchant"]).required(),
					parameters: object(
					{
						color: colorCreate,
						color_temperature: object({mirek: number().min(153).max(500).required()}),
						speed: number().required()
					})
				})
			}).default(undefined),
			dynamics: object({duration: number()}).default(undefined),
		}).required()
	}).required()),
	palette: object(
	{
		color: array(object(
		{
			color: colorCreate.required(),
			dimming: object({brightness: number().max(100).required()}).required()
		})).max(9).required(),
		color_temperature: array(object(
		{
			color_temperature: object({mirek: number().min(153).max(500).required()}).required(),
			dimming: object({brightness: number().max(100).required()}).required()
		})).max(1).required(),
		dimming: array(object(
		{
			brightness: number().max(100).required()
		})).max(1).required(),
	}).default(undefined),
	speed: number().min(0).max(1),
	auto_dynamic: boolean()
});
