
'use server';
/**
 * @fileOverview A text-to-speech AI agent.
 *
 * - convertTextToSpeech - A function that handles the text-to-speech conversion.
 * - ConvertTextToSpeechOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const ConvertTextToSpeechOutputSchema = z.object({
  media: z.string().describe('The base64 encoded WAV audio data URI.'),
});
export type ConvertTextToSpeechOutput = z.infer<
  typeof ConvertTextToSpeechOutputSchema
>;

export async function convertTextToSpeech(
  text: string
): Promise<ConvertTextToSpeechOutput> {
  return textToSpeechFlow(text);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: ConvertTextToSpeechOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/chirp-en-us',
      config: {
        responseModalities: ['AUDIO'],
      },
      prompt: query,
    });

    if (!media) {
      throw new Error('No media returned from the text-to-speech model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    
    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
