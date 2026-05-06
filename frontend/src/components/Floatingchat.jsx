import React, { useEffect, useRef, useState } from 'react';
import { Send, X, MessageSquare, Bot, Loader } from 'lucide-react';
import { api } from "../utils/api"
import { useNavigate } from 'react-router';

function FloatingChat() {
    const [chatOpen, setChatOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ role: 'ai', content: "Hello! I'm your SwiftCart AI. Ask me about products or top vendors!" }])
    const messagesEndRef = useRef(null)
    const [productData, setProductData] = useState()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSend = async () => {
        setLoading(true)
        const userMessage = { role: "user", content: input }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        try {
            console.log(updatedMessages)
            const response = await api.post('/ai', { msg: updatedMessages })
            if (response.data.success) {
                setMessages(prevMsg => [...prevMsg, { role: 'ai', content: response.data.message, productData: response.data.data }])
            }
            setInput('')
        } catch (error) {
            console.log(error)
            setMessages(prevMsg => [...prevMsg, { role: 'ai', content: "Error while generating response" }])
            setInput('')
        }
        setLoading(false)
    }

    useEffect(() => {
        scrollToBottom()
    }, [null, messages])

    return (
        <div className='fixed right-6 bottom-6 z-50 flex flex-col items-end font-sans'>
            {/* Chat Window */}
            {chatOpen && (
                <div className='w-96 h-[500px] mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300'>

                    {/* Header */}
                    <div className='bg-blue-600 p-4 text-white flex justify-between items-center shadow-md'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-blue-500 rounded-lg'>
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className='font-bold text-sm leading-none'>SwiftCart Assistant</h3>
                                <span className='text-[10px] text-blue-100 flex items-center gap-1 mt-1'>
                                    <span className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className='hover:bg-blue-700 p-1.5 rounded-full transition-colors cursor-pointer'
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Body (Scrollable) */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50'>
                        {/* Example Bot Message */}
                        {messages.map(msg => <div>
                            <div className={`flex flex-col items-${msg.role == "ai" ? 'start' : 'end'} w-full`}>
                                <div className={`${msg.role == 'ai' ? 'bg-white text-gray-800 rounded-tl-none border border-gray-200 ' : 'bg-blue-600 text-white text-sm p-3 rounded-2xl rounded-tr-none shadow-md max-w-[85%] '}  text-sm p-3 rounded-2xl  shadow-sm max-w-[85%]`}>
                                    {msg.content}
                                    {msg.productData && msg.productData.length > 0 &&
                                        <div className="w-full max-w-[320px] bg-white border mt-4 border-gray-200 rounded overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="p-2 text-[10px] font-bold text-gray-500 uppercase">Product</th>
                                                        <th className="p-2 text-[10px] font-bold text-gray-500 uppercase">Vendor</th>
                                                        <th className="p-2 text-[10px] font-bold text-gray-500 uppercase">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {msg.productData.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                            <td className="p-2">
                                                                <div className="flex items-center gap-2">
                                                                    <img src={item.productImage} alt="" className="w-8 h-8 rounded-md object-cover shadow-sm" />
                                                                    <span className="text-[11px] font-medium text-gray-900 truncate max-w-[80px]">
                                                                        {item.productName}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-2">
                                                                <span className="text-[10px] text-blue-600 font-semibold">
                                                                    {item.vendorName}
                                                                </span>
                                                            </td>
                                                            <td className="p-2 text-right">
                                                                <button
                                                                    onClick={() => navigate(`/products/${item.productName}?vendor=${item.vendorName}`)}
                                                                    className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-all font-medium whitespace-nowrap"
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    }
                                </div>
                                <div>
                                </div>
                            </div>
                        </div>)}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className='p-4 bg-white border-t border-gray-100'>
                        <div className='relative flex items-center'>
                            <input
                                type="text"
                                value={input}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className='w-full bg-gray-100 border-none rounded-full py-3 px-5 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all'
                            />
                            <button disabled={loading} className={`absolute right-2 p-2  text-white rounded-full ${loading ? 'bg-gray-500' :'bg-blue-600 hover:bg-blue'}-700 transition-all active:scale-90`} onClick={handleSend}>
                                {loading ? <Loader className='animate-spin' size={15}/> : <Send size={16} />}
                            </button>
                        </div>
                        <p className='text-[10px] text-center text-gray-400 mt-2 font-medium uppercase tracking-widest'>
                            Powered by SwiftCart AI
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer ${chatOpen ? 'bg-white text-gray-600 rotate-90' : 'bg-blue-600 text-white'
                    }`}
            >
                {chatOpen ? <X size={28} /> : <MessageSquare size={26} className='' />}
            </button>
        </div>
    );
}

export default FloatingChat;