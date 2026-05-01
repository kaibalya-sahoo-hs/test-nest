import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage, initChatModel, tool, ToolMessage } from "langchain";
import { ProductService } from 'src/product/product.service';
import {z} from 'zod'


@Injectable()
export class AiService {
    constructor(
        private productService: ProductService
    ) { }
    async getAiResponse(message: string) {

        const model = await initChatModel('llama-3.1-8b-instant', { modelProvider: "groq", apiKey: process.env.GROQ_API_KEY })

        const getTotalProducts = tool(
            async ({ input } = {}) => {
                return 1000
            },
            {
                name: "getTotalProducts",
                description: "This tool returns the total number of products available in the database",
                schema: z.object({ input: z.string().optional() })
            }
        )

        
        const getTopVendorsByProductName = tool(async({productName}) => {
            return await this.productService.getTopVendorsByProductName(productName)
        }, {
            name: "getTopVendorsByProductName",
            description: "This tool return an array of top vendors accroding to the product,vendors containing their order count and name",
            schema: z.object({
                productName: z.string()
            })
        })
        
        const getToolsName = { "getTotalProducts": getTotalProducts, "getTopVendorsByProductName": getTopVendorsByProductName }

        const tools = [getTotalProducts, getTopVendorsByProductName]
        const SYSTEM_PROMPT = new SystemMessage(`
            You are an helpful chat assistant of the ecommerce store called SiwftCart
            U have to answer the users query that are only related to Store, u have to answer users like
            a customer service usually talk with their customers like that in a netural voice not like 'I am gald to know that' and all
            just stay neutral and answer users query


            Rules:
                1. You have to answer the questions that are related to the shop only, dont answer the questions that are not related to it
                2. You have to answer as a customer care supprot only  

            Available tools:
            - "getTotalProducts": "this tool is used to find the total products available"
            - "getTopVendorsByProductName" - "this tool is used to find the top vendors for a specific product"
            
        `)

        const messages: any = [
            SYSTEM_PROMPT,
            new HumanMessage(message)
        ]

        const modelWithTools = await model.bindTools(tools)

        let response = await modelWithTools.invoke(messages)

        if (response && response.tool_calls && response.tool_calls.length > 0) {
            messages.push(response)
            for (const toolCall of response.tool_calls) {
                if (toolCall && toolCall.name && getToolsName[toolCall.name]) {
                    console.log('toolCall', toolCall)

                    let parsedArgs: any = undefined
                    try {
                        if (typeof toolCall.args === 'string') {
                            parsedArgs = JSON.parse(toolCall.args)
                        } else {
                            parsedArgs = toolCall.args
                        }
                    } catch (e) {
                        parsedArgs = toolCall.args
                    }

                    const result = await getToolsName[toolCall.name].invoke(parsedArgs)
                    const content = typeof result === 'string' ? result : JSON.stringify(result)
                    const toolMessage = new ToolMessage({
                        content: content,
                        tool_call_id: toolCall.id || '',
                    })

                    messages.push(toolMessage)
                }
            }

            response = await modelWithTools.invoke(messages)
        }

        console.log(response.content)
        return { response: response?.content ?? null, success: true }
    }
}
