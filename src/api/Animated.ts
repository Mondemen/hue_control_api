import BezierEasing from "bezier-easing";
import { Bezier } from "bezier-js";
import { convertMany } from "convert";
import Color, { ColorValue, XYValue } from "../lib/Color";
import MathLib from "../lib/MathLib";
import { LightStreamInternal } from "./device/LightStream";
import
{
	AnimationModifierBrightness,
	AnimationModifierBrightnessConfig,
	AnimationModifierColor,
	AnimationModifierColorConfig,
	AnimationModifierConfig,
	AnimationModifierFlicker,
	AnimationModifierFlickerConfig,
	AnimationModifierLightning,
	AnimationModifierLightningConfig,
	AnimationModifierPalette,
	AnimationModifierColorPaletteConfig,
	AnimationModifierWave,
	AnimationModifierWaveConfig,
	AnimationTimingConfig,
	Duration,
	SequenceAnimation,
	TimingAnimation,
	TransitionFunction,
	AnimationModifierBrightnessPaletteConfig
} from "../../types/Animation";

const LIGHTING_CURVE = new Bezier({x: 0, y: 0}, {x: 0, y: 1}, {x: 0.15, y: 1.625}, {x: 1, y: 0});
const TRANSITION_FUNCTIONS: Record<TransitionFunction, BezierEasing.EasingFunction> =
{
	"ease": BezierEasing(0.25, 0.1, 0.25, 1),
	"ease-in": BezierEasing(0.42, 0, 1.0, 1),
	"ease-out": BezierEasing(0, 0, 0.58, 1),
	"ease-in-out": BezierEasing(0.42, 0, 0.58, 1),
	"linear": BezierEasing(0.0, 0.0, 1.0, 1)
};

function convertDuration(duration: number | Duration)
{
	return (typeof duration === "number" ? duration : convertMany(duration).to("ms"));
}

function getCurveValueAt(curve: Bezier, x: number)
{
	const roots = Bezier.getUtils().roots(curve.points.map((p, i) => ({x: i / 3, y: p.x - x})));
	const t = x === 0 ? 0 : (x === 1 ? 1 : roots[0]);

	return (curve.get(t).y);
}

//#region Stream testers
function isTimingAnimation(animation: any): animation is TimingAnimation
{
	return (typeof animation?.frames === "function" && typeof animation?.start === "function");
}

function isModifierBrightness(modifier: any): modifier is AnimationModifierBrightness
{
	return (modifier?.type === "brightness" && typeof modifier?.start === "function");
}

function isModifierColor(modifier: any): modifier is AnimationModifierColor
{
	return (modifier?.type === "color" && typeof modifier?.start === "function");
}
//#endregion Stream testers

//#region Transitions
function brightnessTransition(frame: number, totalFrame: number, brightness: number[], transitionFunction: keyof typeof TRANSITION_FUNCTIONS | [number, number, number, number] = "linear")
{
	const frameInterval = totalFrame / (brightness.length - 1);
	const index = Math.trunc(frame / frameInterval) % (brightness.length - 1);
	let intervalPercent = (frame % frameInterval) / frameInterval;

	if (Array.isArray(transitionFunction))
		intervalPercent = BezierEasing(...transitionFunction)(intervalPercent);
	else if (transitionFunction !== "linear")
		intervalPercent = TRANSITION_FUNCTIONS[transitionFunction](intervalPercent);
	if (frame >= totalFrame)
		return (brightness.at(-1) as number);
	return (brightness[index] + (brightness[index + 1] - brightness[index]) * intervalPercent);
}

function brightnessPaletteTransition(frame: number, frameInterval: number, brightness: number[], transitionFunction: keyof typeof TRANSITION_FUNCTIONS | [number, number, number, number] = "linear")
{
	const index = Math.trunc(frame / frameInterval);
	const current = brightness[index % brightness.length];
	const next = brightness[(index + 1) % brightness.length];
	let intervalPercent = (frame % frameInterval) / frameInterval;

	if (Array.isArray(transitionFunction))
		intervalPercent = BezierEasing(...transitionFunction)(intervalPercent);
	else if (transitionFunction !== "linear")
		intervalPercent = TRANSITION_FUNCTIONS[transitionFunction](intervalPercent);
	return (current + (next - current) * intervalPercent);
}

function colorTransition(frame: number, totalFrame: number, colors: ColorValue[], transitionFunction: keyof typeof TRANSITION_FUNCTIONS | [number, number, number, number] = "linear")
{
	const frameInterval = totalFrame / (colors.length - 1);
	const index = Math.trunc(frame / frameInterval) % (colors.length - 1);
	const current = new Color(colors[index]);
	const next = new Color(colors[index + 1]);
	let intervalPercent = (frame % frameInterval) / frameInterval;
	let x: number, y: number;

	if (Array.isArray(transitionFunction))
		intervalPercent = BezierEasing(...transitionFunction)(intervalPercent);
	else if (transitionFunction !== "linear")
		intervalPercent = TRANSITION_FUNCTIONS[transitionFunction](intervalPercent);
	x = current.x + (next.x - current.x) * intervalPercent;
	y = current.y + (next.y - current.y) * intervalPercent;
	if (frame >= totalFrame)
		return (new Color(colors.at(-1) as ColorValue).xy());
	return ({x, y} as XYValue);
}

function colorPaletteTransition(frame: number, frameInterval: number, colors: ColorValue[], transitionFunction: keyof typeof TRANSITION_FUNCTIONS | [number, number, number, number] = "linear")
{
	const index = Math.trunc(frame / frameInterval);
	const current = new Color(colors[index % colors.length]);
	const next = new Color(colors[(index + 1) % colors.length]);
	let intervalPercent = (frame % frameInterval) / frameInterval;
	let x: number, y: number;

	if (Array.isArray(transitionFunction))
		intervalPercent = BezierEasing(...transitionFunction)(intervalPercent);
	else if (transitionFunction !== "linear")
		intervalPercent = TRANSITION_FUNCTIONS[transitionFunction](intervalPercent);
	x = current.x + (next.x - current.x) * intervalPercent;
	y = current.y + (next.y - current.y) * intervalPercent;
	return ({x, y} as XYValue);
}

function flickerTransition(value: number, config?: AnimationModifierFlickerConfig)
{
	const sleep = 0.5;
	const position = Math.random();
	const op = MathLib.map(Math.random(), 0, 1, 0, 0.025 * (config?.intensity ?? 1));
	let brightness = MathLib.map(value, 0, 100, 0, 1);

	if (position < (0.5 - (sleep / 2)))
		brightness = (brightness - op < MathLib.map(config?.min ?? 0, 0, 100, 0, 1)) ? (brightness + op) : (brightness - op);
	else if (position > (0.5 + (sleep / 2)))
		brightness = (brightness + op > MathLib.map(config?.max ?? 100, 0, 100, 0, 1)) ? (brightness - op) : (brightness + op);
	return (MathLib.map(brightness, 0, 1, 0, 100));
}
//#endregion Transitions

function animationModifierContext(frame: number, totalFrame: number, config: AnimationModifierConfig | undefined, framesPerSecond: number, callback: (frame: number, totalFrame: number) => void)
{
	const currentFrame = frame % (totalFrame + 1);

	if (!currentFrame)
		config?.onBegin?.();
	callback(currentFrame, totalFrame - 1);
	if (currentFrame >= totalFrame)
		config?.onEnd?.();
}

export default class Animation
{
	static Modifier =
	{
		brightness(config: AnimationModifierBrightnessConfig): AnimationModifierBrightness
		{
			return ({
				type: "brightness",
				start(light, frame, totalFrame, framesPerSecond)
				{
					animationModifierContext(frame, totalFrame, config, framesPerSecond, (frame, totalFrame) =>
					{
						if (Array.isArray(config.brightness))
						{
							if (!config.brightness.length)
								return;
							if (config.brightness.length === 1)
								light.setBrightness(config.brightness[0]);
							else
								light.setBrightness(brightnessTransition(frame, totalFrame, config.brightness, config.transitionFunction));
						}
						else
							light.setBrightness(config.brightness);
					});
				}
			})
		},
		color(config: AnimationModifierColorConfig): AnimationModifierColor
		{
			let valuesUpdated = false;

			return ({
				type: "color",
				start(light, frame, totalFrame, framesPerSecond)
				{
					if (!valuesUpdated)
					{
					if (Array.isArray(config.color))
						config.color = config.color.map(color => new Color(color, light.getLight().getColorGamut())) as [ColorValue, ColorValue, ...ColorValue[]];
					else
						config.color = new Color(config.color, light.getLight().getColorGamut());
						valuesUpdated = true;
					}
					animationModifierContext(frame, totalFrame, config, framesPerSecond, (frame, totalFrame) =>
					{
						if (Array.isArray(config.color))
						{
							if (!config.color.length)
								return;
							if (config.color.length === 1)
								light.setColor(config.color[0]);
							else
								light.setColor(colorTransition(frame, totalFrame, config.color, config.transitionFunction));
						}
						else
							light.setColor(config.color);
					});
				}
			})
		},
		colorPalette(config: AnimationModifierColorPaletteConfig): AnimationModifierPalette
		{
			let valuesUpdated = false;

			return ({
				type: "color",
				start(light, frame, totalFrame, framesPerSecond)
				{
					if (!valuesUpdated)
					{
						config.color = config.color.map(color => new Color(color, light.getLight().getColorGamut())) as [ColorValue, ColorValue, ...ColorValue[]];
						valuesUpdated = true;
					}
					animationModifierContext(frame, totalFrame, config, framesPerSecond, frame =>
					{
						if (!config.color.length)
							return;
						if (config.color.length === 1)
							light.setColor(config.color[0]);
						else
							light.setColor(colorPaletteTransition(frame, Math.round(framesPerSecond * (convertDuration(config.transition) / 1000)), config.color, config.transitionFunction));
					});
				}
			})
		},
		brightnessPalette(config: AnimationModifierBrightnessPaletteConfig): AnimationModifierPalette
		{
			return ({
				type: "color",
				start(light, frame, totalFrame, framesPerSecond)
				{
					animationModifierContext(frame, totalFrame, config, framesPerSecond, frame =>
					{
						if (!config.brightness.length)
							return;
						if (config.brightness.length === 1)
							light.setBrightness(config.brightness[0]);
						else
							light.setBrightness(brightnessPaletteTransition(frame, Math.round(framesPerSecond * (convertDuration(config.transition) / 1000)), config.brightness, config.transitionFunction));
					});
				}
			})
		},
		flicker(config?: AnimationModifierFlickerConfig): AnimationModifierFlicker
		{
			return ({
				type: "brightness",
				start(light, frame, totalFrame, framesPerSecond)
				{
					animationModifierContext(frame, totalFrame, config, framesPerSecond, () =>
					{
						light.setBrightness(flickerTransition(light.getBrightness() ?? config?.min ?? 0, config));
					});
				},
			});
		},
		lightning(config?: AnimationModifierLightningConfig): AnimationModifierLightning
		{
			return ({
				type: "brightness",
				start(light, frame, totalFrame, framesPerSecond)
				{
					animationModifierContext(frame, totalFrame, config, framesPerSecond, (frame, totalFrame) =>
					{
						light.setBrightness(MathLib.map(Math.random(), 0, 1, 0, getCurveValueAt(LIGHTING_CURVE, frame / totalFrame) * (config?.max ?? 100)));
					});
				},
			});
		},
		wave(config?: AnimationModifierWaveConfig): AnimationModifierWave
		{
			return ({
				type: "brightness",
				start(light, frame, totalFrame, framesPerSecond)
				{
					animationModifierContext(frame, totalFrame, config, framesPerSecond, frame =>
					{
						const brightness = Math.round(MathLib.map(Math.sin((config?.frequency ?? 0.05) * frame), -1, 1, config?.min ?? 0, config?.max ?? 100));

						light.setBrightness(brightness);
					});
				},
			});
		}
	}

	static timing(config: AnimationTimingConfig): TimingAnimation
	{
		function getFrames(light: LightStreamInternal, id: string, framesPerSecond: number)
		{
			if (typeof light.animationData[id]?.frames === "number")
				return (light.animationData[id].frames as number);
			light.animationData[id] ??= {frames: 0, totalFrames: 0, loop: 1};
			if (typeof config.duration === "number" || typeof config.duration === "string")
				light.animationData[id].frames = Math.round(framesPerSecond * (convertDuration(config.duration) / 1000));
			else
				light.animationData[id].frames = Math.round(framesPerSecond * (MathLib.map(Math.random(), 0, 1, convertDuration(config.duration.min), convertDuration(config.duration.max)) / 1000));
			return (light.animationData[id].frames as number);
		}

		function getTotalFrames(light: LightStreamInternal, id: string, framesPerSecond: number)
		{
			let frames: number;

			if (typeof light.animationData[id]?.totalFrames === "number")
				return (light.animationData[id].totalFrames as number);
			frames = getFrames(light, id, framesPerSecond);
			light.animationData[id] ??= {frames: 0, totalFrames: 0, loop: 1};
			if (config.loop)
			{
				if (typeof config.loop === "number")
					light.animationData[id].loop = config.loop;
				else
					light.animationData[id].loop = Math.round(MathLib.map(Math.random(), 0, 1, config.loop.min, config.loop.max));
			}
			else
				light.animationData[id].loop = 1;
			light.animationData[id].totalFrames = frames * light.animationData[id].loop;
			return (light.animationData[id].totalFrames as number);
		}

		return ({
			frames: getTotalFrames,
			start(light, id, frame, totalFrame, framesPerSecond)
			{
				const frames = getFrames(light, id, framesPerSecond);
				const totalFrames = getTotalFrames(light, id, framesPerSecond);
				const frameCount = totalFrame / (light.animationData[id].loop ?? 1);
				const currentFrame = frame % frameCount;

				animationModifierContext(frame, totalFrames, config, framesPerSecond, () =>
				{
					if (!frame)
					{
						light.animationData[id] ??= {frames: 0, totalFrames: 0, loop: 1};
						if (config.loop && typeof config.loop !== "number")
							light.animationData[id].loop = Math.round(MathLib.map(Math.random(), 0, 1, config.loop.min, config.loop.max));
						if (config.duration && typeof config.duration !== "number" && typeof config.duration !== "string")
							light.animationData[id].frames = Math.round(framesPerSecond * (MathLib.map(Math.random(), 0, 1, convertDuration(config.duration.min), convertDuration(config.duration.max)) / 1000));
						light.animationData[id].totalFrames = light.animationData[id].frames * light.animationData[id].loop;
					}
					if (isModifierColor(config.color))
						config.color.start(light, currentFrame, frames, framesPerSecond);
					else if (config.color !== undefined)
						Animation.Modifier.color({color: config.color}).start(light, currentFrame, frames, framesPerSecond);

					if (isModifierBrightness(config.brightness))
						config.brightness.start(light, currentFrame, frames, framesPerSecond);
					else if (config.brightness !== undefined)
						Animation.Modifier.brightness({brightness: config.brightness}).start(light, currentFrame, frames, framesPerSecond);
				});
			}
		})
	}

	static sequence(animations: (AnimationTimingConfig | TimingAnimation)[]): SequenceAnimation
	{
		return ({
			start(light, frame, framesPerSecond = 50)
			{
				const animationList = animations.map(animation => isTimingAnimation(animation) ? animation : Animation.timing(animation));
				const totalFrames = animationList.reduce((count, animation, i) => count + animation.frames(light, `SEQ_${i}`, framesPerSecond), 0);
				const currentFrame = (frame - light.animationFrameOffset) % (totalFrames + 1);
				const framesList = animationList.map((anim, i) => anim.frames(light, `SEQ_${i}`, framesPerSecond));
				const frameOffsetList = framesList.map((_, i, list) => list.slice(0, i).reduce((count, frames) => count + frames, 0));
				const index = frameOffsetList.findLastIndex(frame => currentFrame >= frame);

				// console.log(totalFrames, framesList);
				// if (!index)
				// 	console.log(`${id}/SEQ_${index}`, currentFrame - frameOffsetList[index], framesList[index], index, frameOffsetList);
				animationList.at(index)?.start(light, `SEQ_${index}`, currentFrame - frameOffsetList[index], framesList[index], framesPerSecond);
				if (currentFrame >= totalFrames)
					light.animationFrameOffset = frame + 1;
			}
		});
	}
}
