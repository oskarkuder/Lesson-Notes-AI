
import { GoogleGenAI, Type } from "@google/genai";
import type { NoteData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const notesSchema = {
    type: Type.OBJECT,
    properties: {
        transcription: {
            type: Type.STRING,
            description: "A full, word-for-word transcription of the entire audio recording.",
        },
        title: {
            type: Type.STRING,
            description: "A concise, descriptive title for the lecture or meeting.",
        },
        summary: {
            type: Type.STRING,
            description: "A 2-3 sentence summary of the entire recording.",
        },
        keyTopics: {
            type: Type.ARRAY,
            description: "A list of the main topics discussed.",
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: {
                        type: Type.STRING,
                        description: "The name of the key topic.",
                    },
                    points: {
                        type: Type.ARRAY,
                        description: "Detailed bullet points covering the essentials of this topic.",
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
                required: ["topic", "points"]
            },
        },
    },
    required: ["transcription", "title", "summary", "keyTopics"],
};

const fileToGenerativePart = async (file: Blob) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const generateNotesFromAudio = async (audioBlob: Blob, languageCode: string): Promise<Omit<NoteData, 'userId'>> => {
    const audioPart = await fileToGenerativePart(audioBlob);

    let prompt;
    if (languageCode === 'auto') {
        prompt = `You are an expert academic assistant. First, automatically detect the primary language of the following audio recording. Then, perform all of the following tasks in the detected language:
1. Provide a complete, word-for-word transcription of the audio.
2. Generate a comprehensive, well-structured set of notes based on the content.
The output must be in JSON format conforming to the provided schema. The notes should include a concise title, a brief summary, and a list of key topics with detailed bullet points.`;
    } else {
        const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(languageCode.split('-')[0]) || languageCode;
        prompt = `You are an expert academic assistant. The following audio is in ${languageName}. Listen to the recording. First, provide a complete, word-for-word transcription of the audio in ${languageName}. Then, based on the content, generate a comprehensive, well-structured set of notes, also in ${languageName}. The output must be in JSON format conforming to the provided schema. The notes should include a concise title, a brief summary, and a list of key concepts with detailed bullet points.`;
    }

    const textPart = {
        text: prompt,
    };
    
    console.log(`Sending request to Gemini with language setting: ${languageCode}`);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [audioPart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: notesSchema,
        },
    });
    
    console.log("Received response from Gemini.");
    const jsonText = response.text;

    try {
        const parsedJson = JSON.parse(jsonText);
        // Basic validation to ensure the parsed object matches the expected structure
        if (parsedJson.title && parsedJson.summary && Array.isArray(parsedJson.keyTopics) && typeof parsedJson.transcription === 'string') {
            return parsedJson as Omit<NoteData, 'userId'>;
        } else {
            throw new Error("Parsed JSON does not match NoteData structure.");
        }
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText, e);
        throw new Error("The AI returned an invalid response format.");
    }
};
