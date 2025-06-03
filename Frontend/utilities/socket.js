import { io } from 'socket.io-client'; 
import { API_URL } from '@env' 

const socket = io(`${API_URL}`, { 
    transports: ['websocket'], 
    autoConnect: false, 
    reconnection: false,
}) 

export default socket