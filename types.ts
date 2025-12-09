export interface ThumbnailGenerationState {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null; // Base64 string
}

export enum ColorTheme {
  CYAN_PINK = 'Cyan & Pink',
  PURPLE_BLUE = 'Purple & Blue',
  LIME_YELLOW = 'Lime & Yellow',
  ORANGE_RED = 'Orange & Red',
}

export interface GenerationRequest {
  title: string;
  imageBase64: string;
  theme: ColorTheme;
}
