import * as faceapi from '@vladmandic/face-api';
import { Canvas, Image, ImageData } from 'canvas';

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Flag to ensure models are loaded only once per function instance
let modelsLoaded = false;

class FaceRecognitionService {
  private constructor() {
    // Private constructor to enforce singleton-like behavior
  }

  private static instance: FaceRecognitionService;

  public static getInstance(): FaceRecognitionService {
    if (!FaceRecognitionService.instance) {
      FaceRecognitionService.instance = new FaceRecognitionService();
    }
    return FaceRecognitionService.instance;
  }

  /**
   * Loads face-api models if they haven't been loaded already.
   */
  public async loadModels(): Promise<void> {
    if (!modelsLoaded) {
      console.log('Loading face-api models...');
      await faceapi.nets.ssdMobilenetv1.loadFromUri(
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
      );
      await faceapi.nets.faceLandmark68Net.loadFromUri(
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
      );
      await faceapi.nets.faceRecognitionNet.loadFromUri(
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'
      );
      modelsLoaded = true;
      console.log('Face-api models loaded.');
    }
  }

  /**
   * Detects a single face in an image buffer and returns its detection with landmarks and descriptor.
   * @param imageBuffer The image data as a Buffer.
   * @returns A Promise resolving to FaceDetectionWithFaceLandmarks<FaceLandmarks68> & WithFaceDescriptor<any> | undefined.
   */
  public async detectFace(imageBuffer: Buffer) {
    const img = new Image();
    img.src = imageBuffer;
    const canvas = new Canvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();
  }

  /**
   * Compares two face descriptors and returns the Euclidean distance.
   * @param descriptor1 The first face descriptor.
   * @param descriptor2 The second face descriptor.
   * @returns The Euclidean distance between the two descriptors.
   */
  public compareDescriptors(descriptor1: Float32Array, descriptor2: Float32Array): number {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
  }
}

export const faceRecognitionService = FaceRecognitionService.getInstance();
