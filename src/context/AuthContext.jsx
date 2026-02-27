import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);

                // Clear previous doc listener if any
                if (unsubscribeDoc) unsubscribeDoc();

                // Listen for real-time updates to the user document
                const docRef = doc(db, "users", user.uid);
                unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserRole(data.role || "user");
                        setUserName(data.name || user.displayName || "User");
                    } else {
                        console.warn("User document does not exist in Firestore. Defaulting to 'user' role.");
                        setUserRole("user");
                        setUserName(user.displayName || "User");
                    }
                    setLoading(false);
                }, (error) => {
                    if (error.code === 'permission-denied') {
                        console.error("Firestore Permission Denied. Check your security rules!");
                    } else {
                        console.error("Error fetching user data:", error);
                    }
                    setUserRole("user");
                    setUserName(user.displayName || "User");
                    setLoading(false);
                });
            } else {
                setCurrentUser(null);
                setUserRole(null);
                setUserName(null);
                if (unsubscribeDoc) {
                    unsubscribeDoc();
                    unsubscribeDoc = null;
                }
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const value = {
        currentUser,
        userRole,
        userName,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
