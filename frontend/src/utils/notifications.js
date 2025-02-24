export const showNotification = (setStatus, message, type) => {
    const id = Date.now();
    setStatus(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setStatus(prev => prev.filter(notif => notif.id !== id));
    }, 5000);
};
