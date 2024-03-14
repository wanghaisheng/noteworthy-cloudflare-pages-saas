import NotFound from '@/app/not-found';
import NoteEditor from '@/components/NoteEditor';
import NoteHeader from '@/components/NoteHeader';
import Resizable from '@/components/Resizable';
import { findNote } from '@/utils/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function NotePage({ params }: { params: { id: string } }) {
  const user_id = cookies().get('user_id')?.value;
  if (!user_id) redirect('/login');

  const { id } = params;
  const note = await findNote(user_id, 'userNotes', params.id);
  if (!note) return <NotFound />;
  const { title, date, owner, content } = note;
  return (
    <Resizable>
      <div className='flex flex-col gap-4 h-full overflow-y-clip'>
        <NoteEditor content={content}>
          <NoteHeader id={id} title={title} date={date.seconds} owner={owner} />
        </NoteEditor>
      </div>
    </Resizable>
  );
}
