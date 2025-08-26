import OpenAI from "openai";
import {
  VoiceEnum,
  type kokoroModelPrecision,
  type Voices,
} from "../../types/shorts";
import { logger } from "../../config";

// Map Kokoro voices to OpenAI voices
const VOICE_MAPPING: Record<string, string> = {
  "af_heart": "alloy",
  "af_alloy": "alloy",
  "af_aoede": "echo",
  "af_bella": "fable",
  "af_jessica": "nova",
  "af_kore": "onyx",
  "af_nicole": "nova",
  "af_nova": "nova",
  "af_river": "onyx",
  "af_sarah": "shimmer",
  "af_sky": "shimmer",
  "am_adam": "alloy",
  "am_echo": "echo",
  "am_eric": "echo",
  "am_fenrir": "onyx",
  "am_liam": "onyx",
  "am_michael": "onyx",
  "am_onyx": "onyx",
  "am_puck": "echo",
  "am_santa": "onyx",
  "bf_emma": "nova",
  "bf_isabella": "nova",
  "bm_george": "onyx",
  "bm_lewis": "onyx",
  "bf_alice": "nova",
  "bf_lily": "nova",
  "bm_daniel": "onyx",
  "bm_fable": "fable",
};

export class Kokoro {
  private openai: OpenAI;

  constructor() {
    // OpenAI will automatically use OPENAI_API_KEY environment variable
    this.openai = new OpenAI();
  }

  async generate(
    text: string,
    voice: Voices,
  ): Promise<{
    audio: ArrayBuffer;
    audioLength: number;
  }> {
    const openaiVoice = VOICE_MAPPING[voice] || "alloy";
    
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: openaiVoice as any,
        input: text,
        response_format: "mp3",
      });

      const arrayBuffer = await mp3.arrayBuffer();
      
      // For MP3, we can't easily calculate the exact duration without decoding
      // We'll estimate based on typical MP3 bitrate (128kbps) and file size
      const fileSize = arrayBuffer.byteLength;
      const estimatedDuration = (fileSize * 8) / (128 * 1000); // duration in seconds
      
      logger.debug({ 
        text, 
        voice, 
        openaiVoice,
        estimatedDuration 
      }, "Audio generated with OpenAI TTS");

      return {
        audio: arrayBuffer,
        audioLength: estimatedDuration,
      };
    } catch (error) {
      logger.error({ error, text, voice }, "Failed to generate audio with OpenAI TTS");
      throw error;
    }
  }

  static concatWavBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    // This method is kept for compatibility but won't be used with OpenAI TTS
    // since OpenAI returns MP3 format directly
    return buffers[0];
  }

  static async init(_dtype: kokoroModelPrecision): Promise<Kokoro> {
    // OpenAI initialization doesn't require model loading like Kokoro
    return new Kokoro();
  }

  listAvailableVoices(): Voices[] {
    const voices = Object.values(VoiceEnum) as Voices[];
    return voices;
  }
}
