import { Injectable } from '@nestjs/common';
import { ContentEmbedding, GoogleGenAI } from "@google/genai";

@Injectable()
export class EmbeddingService {
    constructor(){}
    async createEmbedding(input: string): Promise<ContentEmbedding[] | undefined> {
        const client = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY || ''});
        const response = await client.models.embedContent({
            model: "gemini-embedding-001",
            contents: input,
        });
        console.log(response.embeddings)
        return response.embeddings;
    }
}
