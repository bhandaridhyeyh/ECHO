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
            clearTimeout(timeoutRef.current);
            socket.emit('response-deal', {
              dealId: deal._id,
              status: 'accepted',
            });
          },
        },
        {
          text: 'Reject',
          onPress: () => {
            clearTimeout(timeoutRef.current);
            socket.emit('response-deal', {
              dealId: deal._id,
              status: 'rejected',
            }, (response) => {
              console.log("Server responded to rejected deal:", response);
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );

    timeoutRef.current = setTimeout(() => {
      socket.emit('response-deal', {
        dealId: deal._id,
        status: 'rejected',
      }, (response) => {
        console.log("Server auto-rejected deal after timeout:", response);
      });
    }, 5 * 60 * 1000);
  };

  socket.on('deal-request', handleIncomingDealRequest);

  return () => {
    socket.off('deal-request', handleIncomingDealRequest);
    clearTimeout(timeoutRef.current);
  };
}, []);
