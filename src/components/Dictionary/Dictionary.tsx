import { BookA, X } from 'lucide-react';
import MenuTooltip from '../Tooltip';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDefinition } from '@/actions/dictionary';
import { Separator } from '../ui/separator';
import DictionarySearch from './DictionarySearch';
import ListenWord from './ListenWord';
import DerivedWords from './DerivedWords';
import Example from './Example';

interface DictionaryProps {
  word?: string;
}

export default async function Dictionary({ word }: DictionaryProps) {
  const definition = await getDefinition(word!);

  async function closeDictionary() {
    'use server';

    const headersList = headers();
    const params = headersList.get('search-params');
    const searchParams = new URLSearchParams(params!);

    if (searchParams.has('dfn-open')) {
      searchParams.delete('dfn-open');
      searchParams.delete('dfn-word');

      redirect(`?${searchParams}`);
    } else redirect('?');
  }

  const firstPhoneticWithAudio = definition.phonetics.find(
    (phonetic) => phonetic.audio
  );

  const foundWord = definition.word;

  return (
    <aside className='w-1/4 p-5 pt-0 border-l border-l-midnight h-screen overflow-y-scroll relative'>
      <div className='sticky top-0 pt-5 bg-black'>
        <header className='flex mb-6 items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <BookA size={26} />
            <h2 className='text-xl font-medium'>Dictionary</h2>
          </div>
          <MenuTooltip content='Close dictionary'>
            <form action={closeDictionary}>
              <button
                type='submit'
                className='p-1.5 rounded-full text-silver hover:bg-midnight'
              >
                <X size={18} />
              </button>
            </form>
          </MenuTooltip>
        </header>
        <DictionarySearch />
        <section className='py-4 mt-1 flex items-center justify-between'>
          <div>
            <h3 className='text-3xl font-semibold capitalize leading-none'>
              {foundWord}
            </h3>
            <p className='text-silver font-semibold'>{definition.phonetic}</p>
          </div>
          {firstPhoneticWithAudio && (
            <ListenWord url={firstPhoneticWithAudio.audio} />
          )}
        </section>
      </div>
      {definition.meanings.map((meaning, i) => (
        <section key={i}>
          <div className='flex items-center overflow-hidden gap-4 text-silver mb-3'>
            <p className='italic font-medium text-lg'>{meaning.partOfSpeech}</p>
            <Separator
              orientation='horizontal'
              className='bg-silver/60'
            />
          </div>
          {meaning.definitions.map((definition, i) => {
            if (i < 3) {
              const {
                definition: def,
                antonyms,
                synonyms,
                example,
              } = definition;

              return (
                <div
                  className='mb-2 mx-2'
                  key={def}
                >
                  <p className='text-white/80 flex gap-1.5'>
                    <span className='px-2 rounded-full text-sm leading-6 h-fit items-center text-silver bg-midnight'>
                      {i + 1}
                    </span>
                    {def}
                  </p>
                  <DerivedWords
                    items={synonyms}
                    title='Synonyms'
                  />
                  <DerivedWords
                    items={antonyms}
                    title='Antonyms'
                  />
                  <Example
                    text={example}
                    word={foundWord}
                  />
                </div>
              );
            }
          })}
        </section>
      ))}
    </aside>
  );
}
