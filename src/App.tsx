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
    ListItemText,
    Divider,
} from '@mui/material';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const ChatApp: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]); // Stores all chat messages
    const [input, setInput] = useState<string>(''); // Stores user input
    const [isLoading, setIsLoading] = useState<boolean>(false); // Indicates streaming state
    const chatBoxRef = useRef<HTMLDivElement>(null); // Ref for the chat box to auto-scroll

    // Function to handle sending a message
    const sendMessage = async () => {
        if (!input.trim()) return; // Skip if input is empty

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

                    setMessages((prev) => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                            newMessages[newMessages.length - 1] = botMessage;
                        } else {
                            newMessages.push(botMessage);
                        }
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Error streaming response:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Unable to fetch response.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to the bottom of the chat box
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh', p: 2 }}>
            <Typography variant="h4" gutterBottom>
                DeepSeek deepseek-r1:14b Chat
            </Typography>

            <Card sx={{ flex: 1, overflowY: 'auto', mb: 2 }} ref={chatBoxRef}>
                <CardContent>
                    <List>
                        {messages.map((msg, index) => {
                            const [pre_think, resp] =
                                msg.role !== 'user'
                                    ? msg?.content?.replace(/\n\n/g, '').split('</think>')
                                    : [undefined, msg.content];
                            const think = pre_think && pre_think.length ? pre_think.replace('<think>', '') : undefined;

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
                                            <Typography>{resp}</Typography>
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
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
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
