import Image from 'next/image';

import {Button} from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-teal-500" href="https://example.com">
            Resonance Web!
          </a>
        </h1>

        <p className="mt-3 text-2xl">
          Discover the stories and connections behind everyday objects.
        </p>

        <div className="mt-6">
          <Button>
            <Image
              src="https://picsum.photos/50/50"
              alt="Scan Object"
              width={20}
              height={20}
              className="mr-2"
            />
            Scan Object to Discover Aura
          </Button>
        </div>
      </main>
    </div>
  );
}
