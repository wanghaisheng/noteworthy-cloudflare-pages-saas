'use server';

import { Definition } from '@/types/definition';

export async function getDefinition(word: string) {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    {
      method: 'GET',
      next: { tags: ['update-definition'] },
    }
  );
  const data = await response.json();
  const definition: Definition = data[0];
  return definition;
}
