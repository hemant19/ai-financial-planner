import * as React from 'react';
import {
  Box, Typography, Paper, TextField, IconButton,
  List, ListItem, ListItemText, CircularProgress,
  Avatar, Container
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { getGenerativeModel, ChatSession } from "firebase/ai";
import { ai } from '../firebase';
import { DataService } from '@core/services/data.service';
import { useSelection } from '../context/SelectionContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Advisor() {
  const { selectedMemberId } = useSelection();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [chatSession, setChatSession] = React.useState<ChatSession | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Chat
  React.useEffect(() => {
    const initChat = async () => {
      try {
        const context = await DataService.getPortfolioContext(selectedMemberId);
        const model = getGenerativeModel(ai, {
          model: "gemini-3-flash-preview",
          systemInstruction: `You are an expert AI Personal Finance Advisor.
            Your goal is to provide holistic, data-driven advice to the user based on their specific financial portfolio.

            Here is the User's Current Financial Context:
            ${context}

            Guidelines:
            1. Be professional, encouraging, yet cautious.
            2. Always refer to the specific data provided (e.g., "Your high allocation in Indian Equities...").
            3. Use the 'Verdict' (BUY/HOLD/SELL) from the provided analysis to support your points.
            4. If the user asks about a specific stock, check if it's in the top holdings list first.
            5. Keep answers concise and actionable.`
        });

        const session = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "Hello, can you analyze my portfolio?" }],
            },
            {
              role: "model",
              parts: [{ text: "Hello! I have analyzed your portfolio. I see you have a mix of Indian Equities, US Stocks, and Mutual Funds. How can I help you optimize your wealth today?" }],
            },
          ],
        });

        setChatSession(session);
        setMessages([
          { role: 'model', text: "Hello! I have analyzed your portfolio. I see you have a mix of Indian Equities, US Stocks, and Mutual Funds. How can I help you optimize your wealth today?" }
        ]);
      } catch (error) {
        console.error("Error initializing AI:", error);
        setMessages([{ role: 'model', text: "I'm having trouble connecting to the financial brain right now. Please check your internet or API configuration." }]);
      }
    };

    initChat();
  }, [selectedMemberId]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatSession.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error answering that." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AutoAwesomeIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight="bold">
          AI Financial Advisor
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ flexGrow: 1, mb: 2, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8f9fa' }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            {msg.role === 'model' && <Avatar sx={{ bgcolor: 'secondary.main' }}><SmartToyIcon /></Avatar>}
            <Paper
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                borderRadius: 2
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
            </Paper>
            {msg.role === 'user' && <Avatar sx={{ bgcolor: 'primary.dark' }}><PersonIcon /></Avatar>}
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 6 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center' }} component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about your allocation, specific stocks, or investment advice..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || !chatSession}
          size="small"
        />
        <IconButton type="submit" color="primary" disabled={loading || !chatSession} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Paper>
    </Container>
  );
}
