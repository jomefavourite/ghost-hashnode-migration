'use client';

import { Drawer } from 'vaul';
import { Button } from './ui/button';
import Image from 'next/image';

export default function Guide() {
  return (
    <Drawer.Root direction='right'>
      <Drawer.Trigger asChild>
        <Button variant='outline'>Step by step Guide</Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 bg-black/40' />
        <Drawer.Content className='overflow-y-scroll overflow-x-hidden bg-white flex flex-col rounded-t-[10px] h-full w-full sm:w-[600px] mt-24 fixed bottom-0 right-0'>
          <div className='p-4 bg-white flex-1 h-full'>
            <div className='max-w-md mx-auto'>
              <Drawer.Title className='font-bold mb-4'>
                How to export your Ghost blog contents
              </Drawer.Title>

              <div className='space-y-4 mb-5'>
                <div>
                  <div className='mb-2'>
                    <h2 className='font-semibold'>Step 1</h2>
                    <p>
                      Navigate to your Ghost dashboard and click on the settings
                      icons
                    </p>
                  </div>
                  <Image
                    src='/steps/1.png'
                    alt='guide'
                    width={600}
                    height={400}
                  />
                </div>

                <div>
                  <div className='mb-2'>
                    <h2 className='font-semibold'>Step 2</h2>
                    <p>
                      Click on the Import/Export tab and export content button
                      to download your blog's content as a JSON file
                    </p>
                  </div>
                  <Image
                    src='/steps/2.png'
                    alt='guide'
                    width={600}
                    height={400}
                  />
                </div>

                <div>
                  <div className='mb-2'>
                    <h2 className='font-semibold'>Step 3</h2>
                    <p>
                      Navigate to your Hashnode settings and generate a personal
                      token.
                    </p>
                  </div>
                  <Image
                    src='/steps/3.png'
                    alt='guide'
                    width={600}
                    height={400}
                  />
                </div>

                <div>
                  <div className='mb-2'>
                    <h2 className='font-semibold'>Step 4</h2>
                    <p>
                      Copy your publication ID from your dashboard URL, it's the
                      numbers in the URL
                    </p>
                  </div>
                  <Image
                    src='/steps/4.png'
                    alt='guide'
                    width={600}
                    height={400}
                  />
                </div>
              </div>

              <Drawer.Close className='absolute top-4 right-4'>
                <Button variant='outline'>Close</Button>
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
