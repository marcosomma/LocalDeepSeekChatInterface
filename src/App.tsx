import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    List,
    ListItem,
    Divider,
} from '@mui/material';
import { marked } from 'marked';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    htmlContent?: string; // Store pre-parsed HTML for rendering
};

const ChatApp: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const [isThinkPassed, setIsThinkPassed] = useState<boolean>(true);

    // Function to process markdown before rendering
    const processMarkdown = async (message: Message) => {
        if (message.role === 'assistant') {
            if(message.content.includes('<think>')) setIsThinkPassed(false);
            if (message.content.includes('</think>')) {
                setIsThinkPassed(true);
            } else {
                return message;
            }
            if (!isThinkPassed) return message;
            message.htmlContent = await marked.parse(message.content.split('</think>')[1]);
        } else {
            message.htmlContent = message.content; // Users don't use markdown
        }
        return message;
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'deepseek-r1:14b',
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) throw new Error('Failed to connect to the model.');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let botMessage: Message = { role: 'assistant', content: '' };

            if (reader) {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const parsed = JSON.parse(chunk);

                    if (parsed.message && parsed.message.content) {
                        botMessage.content += parsed.message.content;
                    }

                    // Process markdown before updating state
                    const processedMessage = await processMarkdown(botMessage);

                    setMessages((prev) => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                            newMessages[newMessages.length - 1] = processedMessage;
                        } else {
                            newMessages.push(processedMessage);
                        }
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Error streaming response:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Unable to fetch response.', htmlContent: 'Error: Unable to fetch response.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '90vh', p: 2 }}>
            <Typography variant="h4" gutterBottom>
                DeepSeek-r1:14b LOCAL Chat
            </Typography>

            <Card sx={{ flex: 1, overflowY: 'auto', mb: 2 }} ref={chatBoxRef}>
                <CardContent>
                    <List>
                        {messages.map((msg, index) => {
                            const pre_think =
                                msg.role !== 'user'
                                    ? msg?.content?.replace(/\n\n/g, '').split('</think>')[0]
                                    : undefined;
                            const think = pre_think && pre_think.length ? pre_think.replace('<think>', '') : undefined;
                            const resp = msg.role !== 'user' ? msg.htmlContent : msg.content;

                            return (
                                <React.Fragment key={index}>
                                    <ListItem
                                        sx={{
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            display: 'flex',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.300',
                                                color: msg.role === 'user' ? 'white' : 'black',
                                                borderRadius: 2,
                                                p: 1.5,
                                                maxWidth: '75%',
                                            }}
                                        >
                                            {think && think !== '' && (
                                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                                    Think: {think}
                                                </Typography>
                                            )}
                                            <Divider sx={{ my: 0.5 }} />
                                            
                                            {/* Render Markdown safely */}
                                            <Typography
                                                variant="body1"
                                                component="div"
                                                dangerouslySetInnerHTML={{ __html: resp as string }}
                                            />
                                        </Box>
                                    </ListItem>
                                </React.Fragment>
                            );
                        })}
                    </List>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                            console.log('Shift + Enter');
                            setInput(input + '\n');
                            return;
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    disabled={isLoading}
                    multiline
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={sendMessage}
                    disabled={isLoading}
                    sx={{ minWidth: '100px' }}
                >
                    {isLoading ? 'Loading...' : 'Send'}
                </Button>
            </Box>
        </Box>
    );
};

export default ChatApp;
