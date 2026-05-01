import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage, AIMessage, initChatModel } from "langchain";
import { tool } from "langchain"


@Injectable()
export class AiService {
    constructor() { }
    async getAiResponse(message: string) {

        const model = await initChatModel('llama-3.1-8b-instant', { modelProvider: "groq", apiKey: process.env.GROQ_API_KEY })

        const getTotalProducts = tool(
            () => 1000,
            {
                name: "get_total_products",
                description: "This tool is used to get the total products avaliable in the database, this tool return the total number of products"
            })

        const SYSTEM_PROMPT = new SystemMessage(`
            You are an helpful chat assistant of the ecommerce store called SiwftCart
            U have to answer the users query that are only related to Store
        `)

        const messages = [
            SYSTEM_PROMPT,
            new HumanMessage(message)
        ]

        const modelWithTools = await model.bindTools([getTotalProducts])

        const response = await modelWithTools.invoke(messages)
            
        return { respose: response.content, success: true }
    }
}
