import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage, initChatModel, tool, ToolMessage } from "langchain";
import { ProductService } from 'src/product/product.service';
import { z } from 'zod'


@Injectable()
export class AiService {
    constructor(
        private productService: ProductService
    ) { }
    async getAiResponse(incomingMessages: []) {
        // 1. Initialize Model
        const model = await initChatModel('llama-3.1-8b-instant', {
            modelProvider: "groq",
            apiKey: process.env.GROQ_API_KEY
        });

        // 2. Define Tools
        const getTotalProducts = tool(
            async () => "1000",
            {
                name: "getTotalProducts",
                description: "Returns the total number of products available in the store",
                schema: z.object({}),
            }
        );

        const getTopVendorsByProductName = tool(
            async ({ productName }) => {
                const result = await this.productService.getTopVendorsByProductName(productName);
                console.log(result)
                return JSON.stringify(result); // Tools must return strings
            },
            {
                name: "getTopVendorsByProductName",
                description: "Finds top vendors for a product. Returns vendor names, product details, and total order counts.",
                schema: z.object({ productName: z.string() }),
            }
        );

        const getproductsByName = tool(
            async ({productName}) => {
                console.log(productName)
                return await this.productService.getProductsByName(productName)
            },
            {
                name: "getproductsByName",
                description: "this tool is used to find the products by the product name",
                schema: z.object({productName: z.string()})
            }
        )

        // 3. Define the Structured Response Schema
        // Changed to allow for an array of products/vendors since the tool returns a list
        const ResponseSchema = z.object({
            textResponse: z.string().describe("Neutral customer service response text"),
            productData: z.array(z.object({
                productName: z.string(),
                vendorName: z.string(),
                productImage: z.string()
            })).optional().describe("A RAW ARRAY of product objects. Do NOT return this as a string.")
        });

        const tools = [getTotalProducts, getTopVendorsByProductName, getproductsByName];
        const toolsByName = { getTotalProducts, getTopVendorsByProductName, getproductsByName };

        const SYSTEM_PROMPT =`
            You are a neutral customer service assistant for SwiftCart.
            YOu have to maintain a friendly conversation with the user. 

            Rules:
            1. Only answer shop-related queries if user query about something that is not related to the store then dont answer.
            2. Stay neutral. Avoid overly enthusiastic phrases like 'I am glad to help'.
            3. When user asks about a product you should only show the products in our database not other products if not profucts found simplay tel the user
            4. When listing a product, pick the top 2 features from the features array and include them in your textResponse to make the product sound more appealing.

            Available Tools: 
                - getTopVendorsByProductName : Call this tool when user asks about suggesting some product or
                                                suggestion best vendors for a specific product 
                - getproductsByName : Call this tool when user query for something like show me phones or watches 

            Example 1: When user asks about show me hoodie or something you have to call the 'getproductsByName' function
            Example 2: When user asks to sgeesut a watch or something like that you have to call the 'getTopVendorsByProductName' function
            
        `;

        let messages: any[] = [{role: 'system',content: SYSTEM_PROMPT}, ...incomingMessages];

        const modelWithTools = model.bindTools(tools);
        let aiMsg = await modelWithTools.invoke(messages);
        messages.push(aiMsg);

        // Step 2: Handle Tool Calls
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            for (const toolCall of aiMsg.tool_calls) {
                const selectedTool = toolsByName[toolCall.name];
                if (selectedTool && toolCall.id) {
                    const toolResult = await selectedTool.invoke(toolCall.args);
                    const cleanContent =  typeof toolResult === 'string' ? toolResult :  JSON.stringify(toolResult);
                    messages.push({
                        role: 'tool',
                        content: cleanContent,
                        tool_call_id: toolCall.id,
                    });
                }
            }
            const formattingInstruction = `
                    STRICT DATA RULE: 
                    1. Look at the tool output provided in the history.
                    2. Map that data to the 'productData' field.
                    3. 'productData' must be a JSON ARRAY. 
                    4. NEVER wrap the array in quotes or make it a string.
                    5. 'textResponse' is MANDATORY. Do not leave it blank.
                    6. if productData is an array with no element tell user that we dont have that in our store or something like that based on the user query
                    6. if no data of an Empty array is coming from database dont tell the user about random data just say product not found or tell something similar based on user query
                    7. MOST IMPORTANT: IF the tool returns a data you should made the data match with the provided structure 
                       That is {
                            textResponse: string,
                            productData: [{
                                productName: string,
                                vendorName: string,
                                pruductImage: string
                            }]
                       }
                `;

            messages.push({role: 'system', content: formattingInstruction})
            const structuredModel = await model.withStructuredOutput(ResponseSchema);
            const finalResult = await structuredModel.invoke(messages);
            console.log(finalResult)
            return {
                success: true,
                message: finalResult.textResponse,
                data: finalResult.productData || []
            };
        }

        // Fallback for normal conversation without tools
        return {
            success: true,
            message: aiMsg.content,
            data: []
        };
    }
}
