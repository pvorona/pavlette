'use client';

import clsx from 'clsx';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Color,
  ColorArea,
  ColorField,
  ColorPicker as RACColorPicker,
  ColorSlider,
  ColorSwatch,
  Dialog,
  Popover,
  parseColor,
  DialogTrigger,
  Slider,
  Label,
  SliderOutput,
  SliderTrack,
  SliderThumb,
  ColorThumb,
  Switch,
} from 'react-aria-components';

// TODO
// [ ] Undo/redo
// [ ] Save/Load
// [ ] Input color in Text Field
// [ ] CHange background dark light
// [ ] Copy
// [ ] Set Mix Curve

const Defaults = {
  Hue: 0 as number,
  StepCount: 10 as number,
  ColorCount: 1 as number,
  isGreyScale: false as boolean,
  isHueSync: true as boolean,
} as const;

export default function Index() {
  const [stepCount, setStepCount] = useState(Defaults.StepCount);
  const [isGreyScale, setIsGreyScale] = useState(Defaults.isGreyScale);

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
  }, []);

  return (
    <div className="h-full p-8">
      <div className="flex justify-center gap-6">
        <Slider
          className="max-w-60 w-full"
          minValue={1}
          maxValue={10}
          step={1}
          value={stepCount}
          onChange={setStepCount}
        >
          <Label>Colors</Label>
          <SliderOutput className="ml-auto">{stepCount * 2 + 1}</SliderOutput>
          <SliderTrack className="h-4 bg-gray-200">
            <SliderThumb className="bg-blue-600 size-4 ring-4 rounded-full mt-2" />
          </SliderTrack>
        </Slider>

        <Switch isSelected={isGreyScale} onChange={setIsGreyScale}>
          Grey Scale {isGreyScale ? 'On' : 'Off'}
        </Switch>
      </div>

      <div>
        <StepCountContext.Provider value={stepCount}>
          <GreyScaleContext.Provider value={isGreyScale}>
            <PaletteProvider />
          </GreyScaleContext.Provider>
        </StepCountContext.Provider>
      </div>
    </div>
  );
}

type ColorConfiguration = {
  light: Color;
  base: Color;
  dark: Color;

  isHueSync: boolean;
};

function notImplemented(): never {
  throw new Error('Not Implemented');
}

export const PaletteContext = createContext<{
  addColor: () => void;
  getColor: (index: number) => ColorConfiguration;
  removeColor: (index: number) => void;
  duplicateColor: (index: number) => void;

  setIsHueSync: (index: number, setIsHueSync: boolean) => void;

  setReferenceColor: (
    index: number,
    reference: 'dark' | 'base' | 'light',
    color: Color
  ) => void;
}>({
  addColor: notImplemented,
  getColor: notImplemented,
  removeColor: notImplemented,
  duplicateColor: notImplemented,

  setIsHueSync: notImplemented,

  setReferenceColor: notImplemented,
});

export function PaletteProvider() {
  const [colors, setColors] = useState<ColorConfiguration[]>([
    {
      base: parseColor(`hsb(${Defaults.Hue}, 100%, 100%)`),
      dark: parseColor(`hsb(${Defaults.Hue}, 50%, 5%)`),
      light: parseColor(`hsb(${Defaults.Hue}, 50%, 100%)`),

      isHueSync: Defaults.isHueSync,
    },
  ]);

  const addColor = () => {
    setColors((colors) => [
      ...colors,
      {
        base: parseColor(`hsb(${Defaults.Hue}, 100%, 100%)`),
        dark: parseColor(`hsb(${Defaults.Hue}, 50%, 5%)`),
        light: parseColor(`hsb(${Defaults.Hue}, 50%, 100%)`),

        isHueSync: Defaults.isHueSync,
      },
    ]);
  };

  const setReferenceColor = (
    index: number,
    reference: 'dark' | 'base' | 'light',
    referenceColor: Color
  ) => {
    setColors((colors) =>
      colors.map((color, i) => {
        if (i !== index) {
          return color;
        }

        if (!color.isHueSync) {
          return {
            ...color,
            [reference]: referenceColor,
          };
        }

        return {
          ...color,
          dark: parseColor(
            `hsb(${referenceColor.getChannelValue(
              'hue'
            )}, ${color.dark.getChannelValue(
              'saturation'
            )}%, ${color.dark.getChannelValue('brightness')}%)`
          ),
          light: parseColor(
            `hsb(${referenceColor.getChannelValue(
              'hue'
            )}, ${color.light.getChannelValue(
              'saturation'
            )}%, ${color.light.getChannelValue('brightness')}%)`
          ),
          base: parseColor(
            `hsb(${referenceColor.getChannelValue(
              'hue'
            )}, ${color.base.getChannelValue(
              'saturation'
            )}%, ${color.base.getChannelValue('brightness')}%)`
          ),
          [reference]: referenceColor,
        };
      })
    );
  };

  const getColor = (index: number) => colors[index];

  const removeColor = (index: number) => {
    setColors((colors) => colors.filter((_, i) => i !== index));
  };

  const setIsHueSync = (index: number, isHueSync: boolean) => {
    setColors((colors) =>
      colors.map((color, i) => (i === index ? { ...color, isHueSync } : color))
    );
  };

  const duplicateColor = (index: number) => {
    setColors((colors) => {
      const color = colors[index];

      return [...colors.slice(0, index + 1), color, ...colors.slice(index + 1)];
    });
  };

  return (
    <PaletteContext.Provider
      value={{
        addColor,
        getColor,
        removeColor,
        setIsHueSync,
        setReferenceColor,
        duplicateColor,
      }}
    >
      {colors.map((_, index) => (
        <ColorConfiguration
          key={index}
          id={index}
          className={index === 0 ? 'mt-4' : ''}
        />
      ))}

      <Button
        className="mt-4 w-full h-16 rounded-xl text-white font-semibold bg-black"
        onPress={addColor}
      >
        Add Color
      </Button>

      <code className="block">
        {JSON.stringify(
          colors.map(({ base, dark, light }) => ({
            base: base.toString(),
            dark: dark.toString(),
            light: light.toString(),
          })),
          null,
          2
        )}
      </code>
    </PaletteContext.Provider>
  );
}

function ColorConfiguration({
  className,
  id,
}: {
  className?: string | undefined;
  id: number;
}) {
  const stepCount = useContext(StepCountContext);

  const {
    getColor,
    setIsHueSync,
    setReferenceColor,
    removeColor,
    duplicateColor,
  } = useContext(PaletteContext);
  const { dark, base, light, isHueSync } = getColor(id);

  const colors = useMemo(() => {
    return createPalette({
      stepCount,
      base,
      light,
      dark,
    });
  }, [base, dark, light, stepCount]);

  return (
    <div className={clsx(className, 'h-full flex justify-center items-center')}>
      <Switch
        isSelected={isHueSync}
        onChange={(isHueSync) => setIsHueSync(id, isHueSync)}
      >
        Link Hue {isHueSync ? 'On' : 'Off'}
      </Switch>

      <Button onPress={() => removeColor(id)}>Delete</Button>
      <Button onPress={() => duplicateColor(id)}>Duplicate</Button>

      {colors.map((shade, index) => {
        if (index === 0) {
          return (
            <ColorPicker
              key={index}
              value={dark}
              onChange={(color) => {
                setReferenceColor(id, 'dark', color);
              }}
            />
          );
        }

        if (index === colors.length - 1) {
          return (
            <ColorPicker
              key={index}
              value={light}
              onChange={(color) => {
                setReferenceColor(id, 'light', color);
              }}
            />
          );
        }

        if (index === stepCount) {
          return (
            <ColorPicker
              key={index}
              value={base}
              onChange={(color) => {
                setReferenceColor(id, 'base', color);
              }}
            />
          );
        }

        return <ColorShade key={shade.toString()} value={shade} />;
      })}
    </div>
  );
}

export const StepCountContext = createContext(Defaults.StepCount);

export const GreyScaleContext = createContext(false);

const shadeClassName = 'w-20 h-28';

function ColorShade({ value }: { value: string }) {
  const isGreyScale = useContext(GreyScaleContext);

  return (
    <div
      className={shadeClassName}
      style={{
        backgroundColor: value,
        filter: isGreyScale ? 'grayscale(1)' : undefined,
      }}
    />
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: Color;
  onChange: (value: Color) => void;
}) {
  const isGreyScale = useContext(GreyScaleContext);

  return (
    <div className={clsx(shadeClassName, 'relative cursor-pointer')}>
      <RACColorPicker
        value={value}
        onChange={(value) => {
          onChange(value);
        }}
      >
        <DialogTrigger>
          <Button className="size-full outline-none">
            <ColorSwatch
              className="size-full"
              style={{
                filter: isGreyScale ? 'grayscale(1)' : undefined,
              }}
            />
          </Button>
          <div className="absolute left-1 right-1 bottom-2 h-1 rounded-md bg-black pointer-events-none" />

          <Popover>
            <Dialog>
              <ColorArea
                className="size-48 bg-red-600"
                colorSpace="hsb"
                xChannel="saturation"
                yChannel="brightness"
              >
                <ColorThumb className="size-2 ring-4 bg-blue-400 rounded-full" />
              </ColorArea>

              <ColorSlider className="w-full" colorSpace="hsb" channel="hue">
                <SliderTrack className="h-20 ">
                  <ColorThumb className="size-1 ring-4 bg-blue-400 rounded-full" />
                </SliderTrack>
              </ColorSlider>
              {/* <ColorField /> */}
            </Dialog>
          </Popover>
        </DialogTrigger>
      </RACColorPicker>
    </div>
  );
}

export function createPalette({
  base,
  dark = parseColor('black'),
  light = parseColor('white'),
  stepCount = 10,
  colorSpace = 'oklab',
}: {
  base: Color;
  dark?: Color;
  light?: Color;
  stepCount?: number;
  colorSpace?: string;
}) {
  const colors = [];
  const step = Math.floor(100 / stepCount);

  for (let index = 0; index < stepCount; index++) {
    colors.push(
      `color-mix(in ${colorSpace}, ${base}, ${dark} ${100 - step * index}%)`
    );
  }

  colors.push(base.toString());

  for (let index = 0; index < stepCount; index++) {
    colors.push(
      `color-mix(in ${colorSpace}, ${base}, ${light} ${step * (index + 1)}%)`
    );
  }

  return colors;
}
