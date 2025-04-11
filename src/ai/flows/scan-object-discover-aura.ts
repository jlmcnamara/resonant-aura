// Scans an object and discovers its associated 'aura' (stories, history, connections) if the fingerprint exists in the network.
'use server';
/**
 * @fileOverview Scans an object and retrieves its associated aura.
 *
 * - scanObjectDiscoverAura - A function that handles the object scanning and aura discovery process.
 * - ScanObjectDiscoverAuraInput - The input type for the scanObjectDiscoverAura function.
 * - ScanObjectDiscoverAuraOutput - The return type for the scanObjectDiscoverAura function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {scanObject, ObjectScanResult} from '@/services/object-scanner';

const ScanObjectDiscoverAuraInputSchema = z.object({
  imageBase64: z.string().describe('The base64 encoded image of the object to scan.'),
});
export type ScanObjectDiscoverAuraInput = z.infer<typeof ScanObjectDiscoverAuraInputSchema>;

const ScanObjectDiscoverAuraOutputSchema = z.object({
  fingerprint: z.string().describe('The unique digital fingerprint of the scanned object.'),
  aura: z.string().describe('The associated stories, history, and connections of the object.'),
});
export type ScanObjectDiscoverAuraOutput = z.infer<typeof ScanObjectDiscoverAuraOutputSchema>;

export async function scanObjectDiscoverAura(input: ScanObjectDiscoverAuraInput): Promise<ScanObjectDiscoverAuraOutput> {
  return scanObjectDiscoverAuraFlow(input);
}

const discoverAuraPrompt = ai.definePrompt({
  name: 'discoverAuraPrompt',
  input: {
    schema: z.object({
      fingerprint: z.string().describe('The unique digital fingerprint of the scanned object.'),
    }),
  },
  output: {
    schema: z.object({
      aura: z.string().describe('The associated stories, history, and connections of the object.'),
    }),
  },
  prompt: `You are an expert in object resonance, able to determine the stories, history, and connections of an object given its unique fingerprint.\n  \n  Object Fingerprint: {{{fingerprint}}}\n  \n  Please provide the associated aura (stories, history, and connections) of the object. If the object does not have an aura, return an empty string.`,
});

const scanObjectDiscoverAuraFlow = ai.defineFlow<
  typeof ScanObjectDiscoverAuraInputSchema,
  typeof ScanObjectDiscoverAuraOutputSchema
>({
  name: 'scanObjectDiscoverAuraFlow',
  inputSchema: ScanObjectDiscoverAuraInputSchema,
  outputSchema: ScanObjectDiscoverAuraOutputSchema,
},
async input => {
  const objectScanResult: ObjectScanResult = await scanObject(input.imageBase64);
  const fingerprint = objectScanResult.fingerprint;

  const {output} = await discoverAuraPrompt({
    fingerprint: fingerprint,
  });

  return {
    fingerprint: fingerprint,
    aura: output!.aura,
  };
});

