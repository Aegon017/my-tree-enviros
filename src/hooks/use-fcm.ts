"use client";

import { useEffect, useState } from "react";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { notificationService } from "@/services/notification.services";

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState<NotificationPermission | null>(null);

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                    const messaging = await getFirebaseMessaging();
                    if (!messaging) return;

                    const permission = await Notification.requestPermission();
                    setNotificationPermissionStatus(permission);

                    if (permission === "granted") {
                        const currentToken = await getToken(messaging, {
                            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                        });

                        if (currentToken) {
                            setToken(currentToken);
                            // Sync token with backend
                            await notificationService.saveDeviceToken(currentToken);
                        } else {
                            console.warn(
                                "No registration token available. Request permission to generate one."
                            );
                        }
                    }
                }
            } catch (error) {
                console.error("An error occurred while retrieving token:", error);
            }
        };

        retrieveToken();
    }, []);

    useEffect(() => {
        const setupOnMessage = async () => {
            const messaging = await getFirebaseMessaging();
            if (!messaging) return;

            const unsubscribe = onMessage(messaging, (payload) => {
                // Customize how you handle foreground notifications here
                console.log("Foreground message received:", payload);
                // Example: Toast or In-app notification trigger
            });

            return () => unsubscribe();
        }

        setupOnMessage();
    }, []);

    return { token, notificationPermissionStatus };
};
