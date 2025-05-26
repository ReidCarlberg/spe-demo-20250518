import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

export const useChatFlyout = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatFlyout must be used within a ChatProvider');
  }
  return context;
};
