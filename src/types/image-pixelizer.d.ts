declare module 'image-pixelizer' {
  export class Bitmap {
    constructor(width: number, height: number, data: ArrayLike<number>);
    width: number;
    height: number;
    data: ArrayLike<number>;
  }

  export class Options {
    setPixelSize(size: number): this;
    setColorDistRatio(ratio: number): this;
    setClusterThreshold(threshold: number): this;
    setMaxIteration(iteration: number): this;
    setNumberOfColors(number: number): this;
  }

  export default class Pixelizer {
    static Bitmap: typeof Bitmap;
    static Options: typeof Options;
    constructor(bitmap: Bitmap, options: Options);
    pixelize(): Bitmap;
  }
}

