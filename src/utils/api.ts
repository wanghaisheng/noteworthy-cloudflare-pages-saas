import { db } from '@/firebase';
import { NoteType } from '@/types/note-type';
import {
  updateDoc,
  doc,
  arrayUnion,
  Timestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';

interface addNoteProps {
  userId: string;
  title: string;
  content: string;
  owner: string;
  colour: string;
}

export async function addNote({
  userId,
  title,
  content,
  owner,
  colour,
}: addNoteProps) {
  const uid = uuid();
  await updateDoc(doc(db, 'userNotes', userId), {
    notes: arrayUnion({
      uid: uid,
      title: title,
      content: content,
      owner: owner,
      date: Timestamp.now(),
      colour: colour,
    }),
  });
  return uid;
}

export type Collections = 'userNotes' | 'userFavourites' | 'userArchived';

export async function findNote(
  userId: string,
  collection: Collections,
  noteId: string
): Promise<NoteType | null> {
  const noteRef = doc(db, collection, userId);
  const noteDoc = await getDoc(noteRef);
  if (!noteDoc.exists()) return null;
  const noteData = noteDoc.data();
  const note: NoteType = noteData.notes.find(
    (note: NoteType) => note.uid === noteId
  );
  return note;
}

export async function getNotes(userId: string, collection: Collections) {
  const noteRef = doc(db, collection, userId);
  const noteDoc = await getDoc(noteRef);
  if (!noteDoc.exists()) return;
  const noteData = noteDoc.data();
  const notes: NoteType[] = noteData.notes;
  return notes;
}

export async function OverrideNote(
  userId: string,
  noteId: string,
  collection: Collections,
  noteProps?: Partial<NoteType>
) {
  const response = await getDoc(doc(db, collection, userId));
  const data = response.data();
  if (!data) return;
  const notes: NoteType[] = data['notes'];
  if (!notes) return;

  const noteIndex = notes.findIndex((note) => note.uid === noteId);
  if (noteIndex === -1) return;
  const updatedNotes = [...notes];
  updatedNotes[noteIndex] = {
    ...updatedNotes[noteIndex],
    ...noteProps,
  };
  await setDoc(doc(db, collection, userId), { notes: updatedNotes });
}
