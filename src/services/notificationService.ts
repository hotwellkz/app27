import { addDoc, collection, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification } from '../types/chat';

interface NotificationData {
  title: string;
  message: string;
  type: 'inventory' | 'client' | 'payment' | 'estimate' | 'construction';
}

export const sendNotification = async (data: NotificationData) => {
  try {
    // Проверяем существование индекса перед отправкой
    const testQuery = query(
      collection(db, 'notifications'),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc')
    );
    
    await getDocs(testQuery); // Это вызовет ошибку, если индекс отсутствует

    await addDoc(collection(db, 'notifications'), {
      ...data,
      timestamp: serverTimestamp(),
      isRead: false
    });

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const message = `${data.title}\n\n${data.message}`;
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    if (error.code === 'failed-precondition') {
      console.error('Missing required index. Please create the index in Firebase Console.');
    }
    return false;
  }
};

export const subscribeToNotifications = (
  onUpdate: (notifications: Notification[]) => void,
  onError: (error: Error) => void
) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(
      q, 
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        onUpdate(notifications);
      },
      (error) => {
        if (error.code === 'failed-precondition') {
          console.error('Missing required index. Please create the index in Firebase Console.');
        }
        onError(error);
      }
    );
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    onError(error);
    return () => {}; // Return empty unsubscribe function
  }
};

export const sendLowStockNotification = async (productName: string, quantity: number, unit: string) => {
  return sendNotification({
    title: 'Низкий остаток товара',
    message: `Товар "${productName}" требует пополнения. Текущий остаток: ${quantity} ${unit}`,
    type: 'inventory'
  });
};