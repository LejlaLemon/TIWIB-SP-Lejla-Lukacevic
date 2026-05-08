import { doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "./firebase.js";

//user id
let userId = localStorage.getItem("userId");

if (!userId) {
    userId = "user-" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("userId", userId);
}

console.log("User ID:", userId);

//save slot works 
//have different users to have different solts
export async function saveSlot(slot, data) {
    try {
        await setDoc(
            doc(db, "users", userId),
            {
                [`slot${slot}`]: {
                    ...data,
                    updatedAt: Date.now()
                }
            },
            { merge: true }
        );

        console.log(`Saved slot ${slot}`, data);
    } catch (err) {
        console.error("Save failed:", err);
    }
}

//load works 
export async function loadSlot(slot) {
    try {
        const snap = await getDoc(doc(db, "users", userId));

        if (!snap.exists()) return null;

        const data = snap.data();

        return data?.[`slot${slot}`] || null;
    } catch (err) {
        console.warn("Load failed:", err);
        return null;
    }
}

//delete slot (works)
export async function deleteSlot(slot) {
    try {
        await updateDoc(doc(db, "users", userId), {
            [`slot${slot}`]: deleteField()
        });

        console.log(`Deleted slot ${slot}`);
    } catch (err) {
        console.error("Delete failed:", err);
    }
}