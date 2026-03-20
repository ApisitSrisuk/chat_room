import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';

export default function App() {
  const [screen, setScreen] = useState('join'); // 'join' | 'chat'
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const { joinRoom, on, off } = useSocket();

  useEffect(() => {
    const handleUserJoined = ({ self }) => {
      if (self) {
        setCurrentUser(self);
      }
    };

    on('user:joined', handleUserJoined);
    return () => off('user:joined', handleUserJoined);
  }, [on, off]);

  const handleJoin = (name, selectedRoom) => {
    setUsername(name);
    setRoom(selectedRoom);
    joinRoom(name, selectedRoom);
    setScreen('chat');
  };

  const handleLeave = () => {
    setScreen('join');
    setCurrentUser(null);
    // Reconnect socket to clear state
    window.location.reload();
  };

  return (
    <>
      {screen === 'join' && <JoinScreen onJoin={handleJoin} />}
      {screen === 'chat' && (
        <ChatRoom
          username={username}
          room={room}
          currentUser={currentUser}
          onLeave={handleLeave}
        />
      )}
    </>
  );
}
