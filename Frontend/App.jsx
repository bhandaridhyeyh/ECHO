import React, { useEffect, useRef } from 'react';
import { StyleSheet, Alert } from 'react-native';
import StackNavigator from './navigation/StackNavigator';
import socket from './utilities/socket';

const App = () => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingDealRequest = (deal) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      Alert.alert(
        'New Deal Request',
        `New Deal Request from ${deal.buyerId.fullName}`,
        [
          {
            text: 'Accept',
            onPress: () => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              socket.emit('response-deal',{
                dealId: deal._id,
                status: 'accepted',
              });
            },
          },
          {
            text: 'Reject',
            onPress: () => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              socket.emit('response-deal', {
                dealId: deal._id,
                status: 'rejected',
              },(response) => {
              console.log("Server responded to accepted deal:", response);
              });
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );

      timeoutRef.current = setTimeout(() => {
        socket.emit('deal-response', {
          dealId: deal._id,
          status: 'rejected',
        },(response) => {
           console.log("Server responded to accepted deal:", response);
        });
      }, 5 * 60 * 1000);
    };

    socket.on('deal-request', handleIncomingDealRequest);

    return () => {
      socket.off('deal-request', handleIncomingDealRequest);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return <StackNavigator />;
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
