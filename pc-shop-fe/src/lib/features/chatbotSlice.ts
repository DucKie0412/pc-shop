import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  role: string;
  content: string;
}

interface ChatbotState {
  messages: Message[];
}

const initialState: ChatbotState = {
  messages: [],
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setMessages, clearMessages } = chatbotSlice.actions;
export default chatbotSlice.reducer; 