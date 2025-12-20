import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { Property } from "../types";

const PROPERTIES_COLLECTION = "properties";

/**
 * Fetches all properties for a specific user
 */
export const getUserProperties = async (userId: string): Promise<Property[]> => {
    try {
        const q = query(
            collection(db, PROPERTIES_COLLECTION),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        } as Property));
    } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
    }
};

/**
 * Saves or updates a property in Firestore
 */
export const saveProperty = async (userId: string, property: Property): Promise<void> => {
    try {
        const propertyRef = doc(db, PROPERTIES_COLLECTION, property.id);
        await setDoc(propertyRef, {
            ...property,
            userId,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving property:", error);
        throw error;
    }
};

/**
 * Deletes a property from Firestore
 */
export const deletePropertyFromFirestore = async (propertyId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
    } catch (error) {
        console.error("Error deleting property:", error);
        throw error;
    }
};

/**
 * Listens for real-time updates to user properties
 */
export const subscribeToProperties = (userId: string, callback: (properties: Property[]) => void) => {
    const q = query(
        collection(db, PROPERTIES_COLLECTION),
        where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const properties = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        } as Property));
        callback(properties);
    }, (error) => {
        console.error("Properties subscription error:", error);
    });
};
