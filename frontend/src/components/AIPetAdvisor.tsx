import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_ROOT = import.meta.env.VITE_API_URL || '';

type FetchWithBackoff = (url: string, options?: RequestInit, maxRetries?: number) => Promise<unknown>;

const useApiCall = (accessToken: string | null): FetchWithBackoff => {
    const fetchWithBackoff = useCallback<FetchWithBackoff>(async (url, options, maxRetries = 5) => {
        console.log(`[DEBUG] useApiCall: Starting fetch with maxRetries=${maxRetries}`);
        console.log(`[DEBUG] useApiCall: URL:`, url);
        console.log(`[DEBUG] useApiCall: Token present=${!!accessToken}`);
        
        // Prepare headers with Authorization if token is available
        const headers = {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        } as Record<string, string>;
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
            console.log(`[DEBUG] useApiCall: Added Authorization Bearer header`);
        } else {
            console.warn(`[WARN] useApiCall: No access token - request may fail with 401`);
        }
        
        const finalOptions = {
            ...options,
            headers,
        };
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`[DEBUG] useApiCall: Attempt ${attempt + 1}/${maxRetries}`);
                const response = await fetch(url, finalOptions);
                console.log(`[DEBUG] useApiCall: Got response, status=${response.status}, ok=${response.ok}`);

                // On success, parse and return JSON
                if (response.ok) {
                    const json = await response.json();
                    console.log(`[DEBUG] useApiCall: Success! JSON (first 300 chars):`, JSON.stringify(json).substring(0, 300));
                    return json;
                }

                // Retryable errors (rate limit or server error)
                if (response.status === 429 || response.status >= 500) {
                    console.warn(`[DEBUG] useApiCall: Retryable error ${response.status}, will retry...`);
                    throw new Error(`Server error: ${response.status}`);
                }

                // For non-retryable client errors give a clear error with body text
                const bodyText = await response.text();
                console.error(`[ERROR] API returned non-ok status ${response.status}`);
                console.error(`[ERROR] Response body:`, bodyText);
                throw new Error(`API error ${response.status}: ${bodyText}`);

            } catch (error) {
                // Only retry on network issues or server errors. Let other errors bubble after retries.
                const isLast = attempt === maxRetries - 1;
                if (isLast) {
                    console.error(`[ERROR] API Call failed after ${maxRetries} retries:`, error);
                    throw error instanceof Error ? error : new Error(String(error));
                }
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.log(`[DEBUG] useApiCall: Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }, [accessToken]);
    return fetchWithBackoff;
};


// --- 2. TEXT GENERATION (Dr. PetBot Chat) ---

type HistoryItem = { role: 'user' | 'model'; parts: { text: string }[] };

const generateText = async (history: HistoryItem[], fetchWithBackoff: FetchWithBackoff) => {
    console.log(`[DEBUG] generateText: Starting text generation with ${history.length} history items`);
    
    // Prefer backend proxy endpoint; backend returns { text, sources }
    const apiUrl = `${API_ROOT}/agent/chat`;
    console.log(`[DEBUG] generateText: Using API_ROOT="${API_ROOT}"`);
    console.log(`[DEBUG] generateText: Full URL="${apiUrl}"`);

    const payload = { history };
    console.log(`[DEBUG] generateText: Payload:`, { historyLength: history.length });

    try {
        const result = await fetchWithBackoff(apiUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        console.log(`[DEBUG] generateText: Received result:`, result);
        
        // Backend already normalizes response shape to { text, sources }
        const resultObj = result as { text?: string; sources?: IMessageSource[] } | unknown;
        const text = (typeof (resultObj as Record<string, unknown>)?.text === 'string') 
            ? (resultObj as Record<string, unknown>).text 
            : "(empty response from AI)";
        const sources = Array.isArray((resultObj as Record<string, unknown>)?.sources) 
            ? ((resultObj as Record<string, unknown>).sources as IMessageSource[]) 
            : [];
        console.log(`[DEBUG] generateText: Extracted text (${(text as string).length} chars) and ${sources.length} sources`);
        return { text: text as string, sources };
    } catch (error) {
        console.error(`[ERROR] generateText failed:`, error);
        throw error;
    }
};


// --- 4. REACT COMPONENT: APP ---

interface IMessageSource { uri?: string; title?: string }
type MessageType = 'text' | 'loading';
type MessageRole = 'user' | 'model';
interface IMessage {
    role: MessageRole;
    content: string;
    type: MessageType;
    sources?: IMessageSource[];
}

const AIPetAdvisor: React.FC = () => {
    const { accessToken, refreshAccessToken } = useAuth();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // Initialize token and fetch wrapper
    const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(accessToken);
    const fetchWithBackoff = useApiCall(currentAccessToken);

    // Check token on mount and set up initial state
    useEffect(() => {
        const checkToken = async () => {
            if (!accessToken) {
                const newTok = await refreshAccessToken();
                if (!newTok) {
                    setError('Unable to obtain access token');
                    console.log('Token refresh failed');
                    return;
                }
                setCurrentAccessToken(newTok);
            } else {
                setCurrentAccessToken(accessToken);
            }
        };
        checkToken();
    }, [accessToken, refreshAccessToken]);

    // Initial message from the bot
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ 
                role: 'model', 
                content: "Hi there! I'm Dr. PetBot, your expert pet educational advisor. Ask me anything about pet health, nutrition, or behavior!", 
                type: 'text',
                sources: []
            } as IMessage]);
        }
    }, [messages.length]);

    // Scroll to the bottom of the chat when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = useCallback(async (prompt = userInput) => {
        console.log(`[DEBUG] handleSend: prompt="${prompt.substring(0, 50)}...", isGenerating=${isGenerating}`);
        
        if (!prompt.trim() || isGenerating) {
            console.log(`[DEBUG] handleSend: Skipping - empty prompt or already generating`);
            return;
        }

        // Check token before sending
        if (!currentAccessToken) {
            const newTok = await refreshAccessToken();
            if (!newTok) {
                setError('Unable to obtain access token');
                console.log(error);
                return;
            }
            setCurrentAccessToken(newTok);
        }

        // 1. Add user message
        const userMessage: IMessage = { role: 'user', content: prompt, type: 'text' };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsGenerating(true);
        // setShowImageButton(false); // Hide image button until the next text response

        // 2. Prepare history for Gemini
        const history: HistoryItem[] = [...messages, userMessage].map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        console.log(`[DEBUG] handleSend: Prepared history with ${history.length} items`);

        // 3. Add loading message placeholder
        const loadingMessage: IMessage = { role: 'model', content: 'Generating response...', type: 'loading' };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            // 4. Generate Text Response
            const { text, sources } = await generateText(history, fetchWithBackoff);
            
            // 5. Replace loading message with actual text response
            setMessages(prev => prev.slice(0, -1).concat({ 
                role: 'model', 
                content: text, 
                type: 'text',
                sources: sources
            } as IMessage));
            
            // 6. Show image generation button if text generation was successful
            // setShowImageButton(true); 

        } catch (error) {
            console.error("Text generation failed:", error);
            const errMsg = error instanceof Error ? error.message : String(error);
            setMessages(prev => prev.slice(0, -1).concat({ 
                role: 'model', 
                content: `I couldn't generate a response. ${errMsg}`, 
                type: 'text',
                sources: []
            }));
        } finally {
            setIsGenerating(false);
        }
    }, [userInput, isGenerating, messages, fetchWithBackoff, currentAccessToken, refreshAccessToken, error]);

    // --- UI RENDER HELPER COMPONENTS ---

    const MessageBubble: React.FC<{ message: IMessage }> = ({ message }) => {
        const isModel = message.role === 'model';
        const isText = message.type === 'text';
        const isLoad = message.type === 'loading';
        
        let content;
        if (isLoad) {
            content = <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
                      </div>;
        } else {
            content = <div className="prose text-sm max-w-none break-words whitespace-pre-wrap">{message.content}</div>;
        }
        
        return (
            <div className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] md:max-w-[60%] lg:max-w-[50%] p-4 m-2 rounded-xl shadow-lg transition-all duration-300 
                                ${isModel 
                                    ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                                    : 'bg-indigo-500 text-white rounded-tr-none'}`
                                }>
                    {content}
                    
                    {/* Citations / Sources */}
                    {isText && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 italic">
                            <h4 className="font-semibold text-gray-600 mb-1">Sources:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {message.sources.slice(0, 3).map((source, index) => (
                                    <li key={index} className="truncate">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                            {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl flex flex-col h-[90vh] md:h-[85vh]">
                
                {/* Header */}
                <div className="p-4 bg-indigo-600 text-white rounded-t-3xl shadow-md flex items-center">
                    <div className="bg-white p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.188m-2-4a7 7 0 110 14V3a6 6 0 006 6h2c3 0 6 3 6 6v1h-4" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold">Dr. PetBot: Your Educational AI</h1>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200 rounded-b-3xl relative">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            placeholder={isGenerating ? "Processing..." : "Ask about care, health, or nutrition..."}
                            disabled={isGenerating}
                            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!userInput.trim() || isGenerating}
                            className={`p-3 rounded-xl shadow-md transition-all duration-200 
                                        ${(!userInput.trim() || isGenerating) 
                                            ? 'bg-indigo-300 cursor-not-allowed' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                            title="Send Message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIPetAdvisor;