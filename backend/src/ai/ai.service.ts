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
            async ({ filters }) => {
                const result = await this.productService.getTopVendorsByProductName(filters);
                return JSON.stringify(result); // Tools must return strings
            },
            {
                name: "getTopVendorsByProductName",
                description: "Finds top vendors for a product. Returns vendor names, product details, and total order counts.",
                schema: z.object({ filters: z.object({
                    productName: z.string().optional(),
                    limit: z.number().optional()
                }).optional() }),
            }
        );

        const getProducts = tool(({ filter }) => {
            const f = filter || {};
            const sanitized = {
                name: f.name ?? undefined,
                minAmount: (typeof f.minAmount === 'number') ? f.minAmount : undefined,
                maxAmount: (typeof f.maxAmount === 'number') ? f.maxAmount : undefined,
                features: Array.isArray(f.features) ? f.features : undefined,
            };

            return this.productService.getProducts(sanitized);
        }, {
            name: "getProducts",
            description: "Finds products based on filters. Returns product names, vendor names, and images.",
            schema: z.object({
                filter: z.object({
                    name: z.string().nullable().optional(),
                    minAmount: z.number().nullable().optional(),
                    maxAmount: z.number().nullable().optional(),
                    features: z.array(z.string()).nullable().optional()
                }).nullable().optional()
            }),
        })
        // 3. Define the Structured Response Schema
        // Changed to allow for an array of products/vendors since the tool returns a list
        const ResponseSchema = z.object({
            textResponse: z.string().describe("Neutral customer service response text"),
            productData: z.array(z.object({
                productName: z.string(),
                vendorName: z.string(),
                productImage: z.string()
            })).optional().describe("A RAW ARRAY of product objects. Do NOT return this as a string."),
        });

        const tools = [getTopVendorsByProductName, getProducts];
        const toolsByName = { getTopVendorsByProductName, getProducts };

        const SYSTEM_PROMPT = `
            You are a neutral customer service assistant for SwiftCart.
            YOu have to maintain a friendly conversation with the user. 

            Rules:
            1. Only answer shop-related queries if user query about something that is not related to the store then dont answer.
            2. Stay neutral. Avoid overly enthusiastic phrases like 'I am glad to help'.
            3. When user asks about a product you should only show the products in our database not other products if not profucts found simplay tel the user

            Available Tools: 
                - getTopVendorsByProductName : Call this tool when user asks about suggesting some product or
                                                suggestion best vendors for a specific product
                                                
                                            Example: User: Suggest me a good watch
                                                     AI: To find the best watches, I will check our top vendors for watches.
                                                     (Call the tool 'getTopVendorsByProductName' with parameters {filter: {productName: 'watch'}})
                - getProducts : Call this tool when user query for some product or ask to find some product with specific filters like minAmount, features
                                Example 1 - user asks about laptop under 200000 and should has 144hz display then the tool call should be with parameters  {name: 'laptop', maxAmount: 200000, features: ['144hz', 'display']}
                                Example 2 - If user asks about show me watches then the tool call should be with parameters {filter: {name: 'watch'}}
                                Example 3 - User - Show me Guitars
                                            AI - Here are some guitar (Show the user guitars obtained from th tool call)



        `;  

        let messages: any[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...incomingMessages];

        const modelWithTools = model.bindTools(tools);
        let aiMsg = await modelWithTools.invoke(messages);
        messages.push(aiMsg);

        // Step 2: Handle Tool Calls
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            for (const toolCall of aiMsg.tool_calls) {
                const selectedTool = toolsByName[toolCall.name];
                console.log(toolCall)
                if (selectedTool && toolCall.id) {
                    const toolResult = await selectedTool.invoke(toolCall.args);
                    const cleanContent = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
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
                    5.  When using the extract tool, you must put all output—including the textResponse and the productData—inside the tool arguments. Do not provide a text response outside of the tool.
                    6. 'textResponse' is MANDATORY. Do not leave it blank.
                    7. IMPORTANT: if productData is an array with no element tell user that we dont have that in our store or something like that based on the user query
                    8. If no data of an Empty array is coming from database dont tell the user about random data just say product not found or tell something similar based on user query
                    9. MOST IMPORTANT:If use got data then You should made the data returned by the tool match with the provided structure 
                    That is {
                            textResponse: string, // Mandatory
                            productData: [{       // Optional but if tool returns data then this field must be present and must be an array of objects
                                productName: string,
                                vendorName: string,
                                pruductImage: string
                            }]
                    }
                `;

            messages.push({ role: 'system', content: formattingInstruction })
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
