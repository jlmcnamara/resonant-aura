'use server';

/**
 * @fileOverview Matches resonant objects based on visual similarity using AI.
 *
 * - matchResonantObjects - A function that matches resonant objects.
 * - MatchResonantObjectsInput - The input type for the matchResonantObjects function.
 * - MatchResonantObjectsOutput - The return type for the matchResonantObjects function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {scanObject} from '@/services/object-scanner';

const MatchResonantObjectsInputSchema = z.object({
  imageBase64: z.string().describe('Base64 encoded image of the object to match.'),
  numResults: z.number().default(5).describe('Number of matching objects to return.'),
});
export type MatchResonantObjectsInput = z.infer<typeof MatchResonantObjectsInputSchema>;

const MatchedObjectSchema = z.object({
  fingerprint: z.string().describe('The unique fingerprint of the matched object.'),
  similarityScore: z.number().describe('The similarity score between the input object and the matched object.'),
});

const MatchResonantObjectsOutputSchema = z.object({
  matches: z.array(MatchedObjectSchema).describe('List of matched objects with similarity scores.'),
});
export type MatchResonantObjectsOutput = z.infer<typeof MatchResonantObjectsOutputSchema>;

export async function matchResonantObjects(input: MatchResonantObjectsInput): Promise<MatchResonantObjectsOutput> {
  return matchResonantObjectsFlow(input);
}

const rankObjects = ai.defineTool(
  {
    name: 'rankObjects',
    description: 'Ranks a list of objects based on similarity to a reference object.',
    inputSchema: z.object({
      referenceFingerprint: z.string().describe('The fingerprint of the reference object.'),
      objectFingerprints: z.array(z.string()).describe('The fingerprints of the objects to rank.'),
    }),
    outputSchema: z.array(MatchedObjectSchema),
  },
  async input => {
    // TODO: Implement this by calling an external object ranking/similarity API.
    // This stub returns dummy data.
    return input.objectFingerprints.map(fingerprint => ({
      fingerprint,
      similarityScore: Math.random(), // Replace with actual similarity score
    }));
  }
);

const prompt = ai.definePrompt({
  name: 'matchResonantObjectsPrompt',
  tools: [rankObjects],
  input: {
    schema: z.object({
      referenceFingerprint: z.string().describe('The fingerprint of the reference object.'),
      numResults: z.number().describe('Number of matching objects to return.'),
    }),
  },
  output: {
    schema: MatchResonantObjectsOutputSchema,
  },
  prompt: `You are an AI assistant helping to find resonant objects.
Given a reference object fingerprint, find the most similar objects from a list of object fingerprints, and return the top {{numResults}} matches.

Use the rankObjects tool to rank the objects by similarity.

Make sure to return the matches in the format specified by the MatchResonantObjectsOutputSchema.
`,
});

const matchResonantObjectsFlow = ai.defineFlow<
  typeof MatchResonantObjectsInputSchema,
  typeof MatchResonantObjectsOutputSchema
>(
  {
    name: 'matchResonantObjectsFlow',
    inputSchema: MatchResonantObjectsInputSchema,
    outputSchema: MatchResonantObjectsOutputSchema,
  },
  async input => {
    const referenceObject = await scanObject(input.imageBase64);
    const referenceFingerprint = referenceObject.fingerprint;

    // TODO: Replace this with a call to a service that retrieves a list of object fingerprints from a database.
    const objectFingerprints = [
      'stubbed-unique-object-fingerprint-1',
      'stubbed-unique-object-fingerprint-2',
      'stubbed-unique-object-fingerprint-3',
      'stubbed-unique-object-fingerprint-4',
      'stubbed-unique-object-fingerprint-5',
      'stubbed-unique-object-fingerprint-6',
      'stubbed-unique-object-fingerprint-7',
      'stubbed-unique-object-fingerprint-8',
      'stubbed-unique-object-fingerprint-9',
      'stubbed-unique-object-fingerprint-10',
    ];

    const {output} = await prompt({
      referenceFingerprint,
      numResults: input.numResults,
    });

    // Call rankObjects tool directly
    const rankedObjects = await rankObjects({
      referenceFingerprint: referenceFingerprint,
      objectFingerprints: objectFingerprints
    });

    // Sort the objects by similarity score in descending order
    const sortedObjects = rankedObjects.sort((a, b) => b.similarityScore - a.similarityScore);

    // Take the top numResults objects
    const topObjects = sortedObjects.slice(0, input.numResults);

    return {
      matches: topObjects,
    };
  }
);

