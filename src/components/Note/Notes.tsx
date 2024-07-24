import Note from '@/components/Note/Note';
import SectionTitle from '@/components/SectionTitle';
import Counter from '@/components/Counter';
import SearchNote from '@/components/Note/SearchNote';
import SortDropdown from '@/components/SortDropdown';
import { getFilteredNotes, getFilter } from '@/utils/format-notes';
import { API } from '@/server/api';
import { type ReactNode } from 'react';
import { useSidebarState } from '@/utils/sidebar';
import { currentUser } from '@/server/queries/note';
import { getTranslations } from 'next-intl/server';

export default async function Notes() {
  const user = await currentUser();
  const state = useSidebarState();
  if (!user || !user.id) return;
  const t = await getTranslations('Sidebar');

  const api = new API(user.id);
  const notes = await api.notes.ordinary.get();
  if (!notes) return;
  const { notes: filteredNotes, searchParam } = getFilteredNotes(notes);
  const filter = getFilter();

  if (filter === 'date-new') {
    filteredNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else if (filter === 'date-old') {
    filteredNotes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (filter === 'title') {
    filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filteredNotes.sort(
      (a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime(),
    );
  }
  return (
    <div data-state={state} className='group/root'>
      <SectionTitle title={t('notes')}>
        <Counter />
      </SectionTitle>
      <div className='px-5 flex gap-2 items-center group-data-[state=closed]/root:hidden'>
        <SearchNote />
        <SortDropdown />
      </div>
      <div className='flex flex-col gap-1.5 overflow-y-scroll scrollbar-thin scrollbar-track-black scrollbar-thumb-silver xl:max-h-[400px] lg:max-h-[300px] max-h-[230px] px-5 pb-1 group-data-[state=closed]/root:items-center group-data-[state=closed]/root:overflow-x-hidden'>
        {filteredNotes.length === 0 && searchParam ? (
          <PlaceholderWrapper>
            <h1>
              No note with such name as{' '}
              <span className='italic font-medium'>{searchParam}</span>
            </h1>
          </PlaceholderWrapper>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => {
            const { id, title, colour, content, createdAt } = note;
            return (
              <Note
                key={id}
                href='notes'
                uid={id}
                colour={colour}
                name={title}
                text={content}
                date={createdAt}
              />
            );
          })
        ) : (
          <PlaceholderWrapper>
            <div className='flex flex-col h-full justify-between'>
              <h1 className='italic'>Darkness here, and nothing more.</h1>
              <p className='h-fit'>Try to fill with some note</p>
            </div>
          </PlaceholderWrapper>
        )}
      </div>
    </div>
  );
}

function PlaceholderWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='bg-midnight h-[100px] w-full rounded-sm lg:p-5 p-2 outline-2 outline-offset-2 outline-dashed outline-silver text-silver my-2 select-none'>
      {children}
    </div>
  );
}
