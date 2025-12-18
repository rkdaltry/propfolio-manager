import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from "firebase/storage";
import { db, storage } from "../firebase";

export interface DocumentMetadata {
    id?: string;
    name: string;
    type: string; // mime type
    category: string;
    size: number;
    entityId: string; // propertyId or tenantId
    entityType: 'property' | 'tenant';
    storagePath: string;
    downloadURL: string;
    createdAt?: any;
}

const DOCUMENTS_COLLECTION = "documents";

/**
 * Uploads a file to Firebase Storage and saves its metadata to Firestore
 */
export const uploadDocument = async (
    file: File,
    metadata: { entityId: string, entityType: 'property' | 'tenant', category: string },
    onProgress?: (progress: number) => void
): Promise<DocumentMetadata> => {
    const timestamp = Date.now();
    const storagePath = `documents/${metadata.entityType}/${metadata.entityId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                const docData: Omit<DocumentMetadata, 'id'> = {
                    name: file.name,
                    type: file.type,
                    category: metadata.category,
                    size: file.size,
                    entityId: metadata.entityId,
                    entityType: metadata.entityType,
                    storagePath,
                    downloadURL,
                    createdAt: serverTimestamp()
                };

                const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), docData);
                resolve({ ...docData, id: docRef.id });
            }
        );
    });
};

/**
 * Fetches all documents for a specific entity (property or tenant)
 */
export const getDocumentsByEntity = async (
    entityId: string,
    entityType: 'property' | 'tenant'
): Promise<DocumentMetadata[]> => {
    const q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where("entityId", "==", entityId),
        where("entityType", "==", entityType)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as DocumentMetadata));
};

/**
 * Deletes a document from both Firestore and Storage
 */
export const deleteDocument = async (document: DocumentMetadata): Promise<void> => {
    if (!document.id || !document.storagePath) return;

    // 1. Delete from Storage
    const storageRef = ref(storage, document.storagePath);
    await deleteObject(storageRef);

    // 2. Delete from Firestore
    await deleteDoc(doc(db, DOCUMENTS_COLLECTION, document.id));
};
