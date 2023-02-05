import { db} from "$lib/config/app";
import { collection, doc, setDoc, 
          getDoc, deleteDoc,
          updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; 
import { v4 as uuidv4 } from 'uuid';

export const getMessages = async () => {
  const docRef = doc(db, "chats", "messages");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().messages
  } else {
    return -1;
  }
}

export const sendMessage = async (msg, uname) => {
  const washingtonRef = doc(db, "chats", "messages");
  const day = new Date().toString()
  // Atomically add a new region to the "regions" array field.
  await updateDoc(washingtonRef, {
      messages: arrayUnion({
        message: msg,
        created: day.substring(4,10) + day.substring(15,21),
        uname
      })
  });

}

export const deleteUser = async (uname='', uuid='0x000000000000') => {
  try {
    const docRef = doc(db, "users", uname.trim().toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().id === uuid)
        await deleteDoc(docRef);
    return 0;
  } catch (e) {
    return -1;
  }
}

export const deleteOlderMessages = async () => {
  
  const messages = await getMessages();

  // store no more than 500 messages into array
  if (messages.length > 500) {
    const day = new Date().toString();
      await deleteDoc(doc(db, "chats", "messages"));
      await setDoc(doc(db, "chats", "messages"), {
        messages: arrayUnion({
          message: "All previous messages have been cleared",
          created: day.substring(4,10) + day.substring(15,21),
          uname: "raz0229"
      })
      })
  }


}

export const createUser = async (uname='raz0229') => {
    
    const docRef = doc(db, "users", uname.trim().toLowerCase());
    const usersRef = collection(db, "users");
    const docSnap = await getDoc(docRef);

    // see if user already exists
    if (docSnap.exists()) {
        return -1;
      } else {
        // create new user with that name if not
        try {
            const day = new Date().toString();
            const id = uuidv4();
            await setDoc(doc(usersRef, uname.trim().toLowerCase()), {
              name: uname.trim().toLowerCase(),
              created: day.substring(4,10) + day.substring(15,21),
              id
          })
            return id;
        } catch (e) {
          console.log('caught here')
            return -1;
        }
      
    }
}