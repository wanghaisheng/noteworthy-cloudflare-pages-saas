import NoNotes from '@/components/Note/NoNotes';
import Sidebar from '@/components/Sidebar';
import SubSidebar from '@/components/SubSidebar';
import { currentUser } from '@/queries/note';
import { API } from '@/server/api';
import { StarOff, Sparkles } from 'lucide-react';
import { type ReactNode } from 'react';

export default async function FavouriteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await currentUser();
  if (!user?.id) return;
  const api = new API(user.id);
  const favouriteNotes = await api.notes.favourite.get();
  return (
    <div className='flex h-screen w-full'>
      <Sidebar />
      <SubSidebar
        notes={favouriteNotes!}
        title={'Favourites'}
        href={'favourites'}
      >
        <NoNotes
          headerIcon={<StarOff size={80} strokeWidth={1} />}
          text="You don't have any favourite note"
          paragraph='Choose a note to favourite and make it sparkle!'
          paragraphIcon={<Sparkles size={16} fill='#A3A3A3' />}
        />
      </SubSidebar>
      {favouriteNotes && favouriteNotes.length > 0 && children}
    </div>
  );
}
