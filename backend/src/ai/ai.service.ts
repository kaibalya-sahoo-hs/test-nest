import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage, initChatModel, tool, ToolMessage } from "langchain";
import { ProductService } from 'src/product/product.service';
import { z } from 'zod'


@Injectable()
export class AiService {
    constructor(
        private productService: ProductService
    ) { }
    async getAiResponse(message: string) {
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

        // 3. Define the Structured Response Schema
        // Changed to allow for an array of products/vendors since the tool returns a list
        const ResponseSchema = z.object({
            textResponse: z.string().describe("Neutral customer service response text"),
            productData: z.array(z.object({
                productName: z.string(),
                vendorName: z.string(),
                productImage: z.string()
            })).optional().describe("Structured data when product/vendor info is found")
        });

        const tools = [getTotalProducts, getTopVendorsByProductName];
        const toolsByName = { getTotalProducts, getTopVendorsByProductName };

        const SYSTEM_PROMPT = new SystemMessage(`
            You are a neutral customer service assistant for SwiftCart.
            Rules:
            1. Only answer shop-related queries.
            2. Stay neutral. Avoid overly enthusiastic phrases like 'I am glad to help'.
            3. Use 'getTopVendorsByProductName' to find the best sellers when users ask for recommendations.
            
            Available Tools: 
                - getTopVendorsByProductName : Call this tool when user asks about suggesting some product or
                                                suggestion best vendors for a specific product 

            
        `);

        let messages: any[] = [SYSTEM_PROMPT, new HumanMessage(message)];

        // --- EXECUTION LOOP ---

        // Step 1: Initial call to see if tools are needed
        const modelWithTools = model.bindTools(tools);
        let aiMsg = await modelWithTools.invoke(messages);
        messages.push(aiMsg);

        // Step 2: Handle Tool Calls
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            for (const toolCall of aiMsg.tool_calls) {
                const selectedTool = toolsByName[toolCall.name];
                if (selectedTool && toolCall.id) {
                    const toolResult = await selectedTool.invoke(toolCall.args);
                    const cleanContent = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
                    messages.push(new ToolMessage({
                        content: cleanContent,
                        tool_call_id: toolCall.id,
                    }));
                }
            }
            const formattingInstruction = new SystemMessage(`
    STRICT DATA RULE: 
    1. Look at the tool output provided in the history.
    2. Map that data to the 'productData' field.
    3. 'productData' must be a JSON ARRAY. 
    4. NEVER wrap the array in quotes or make it a string.
    5. 'textResponse' is MANDATORY. Do not leave it blank.
`);
            messages.push(formattingInstruction)
            // Step 3: Final call to generate structured output based on tool results
            const structuredModel = await model.withStructuredOutput(ResponseSchema);
            const finalResult = await structuredModel.invoke(messages);

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
