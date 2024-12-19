'use client';

import { Drawer } from 'vaul';
import { Button } from './ui/button';
import Image from 'next/image';

export default function Guide() {
  return (
    <div className='flex items-center gap-3'>
      <a href='https://github.com/jomefavourite/ghost-hashnode-migration'>
        <svg fill='none' viewBox='0 0 24 24' width='24' height='24'>
          <path
            fill='currentColor'
            d='M12 1.516c-5.938 0-10.75 4.812-10.75 10.75 0 4.748 3.08 8.778 7.352 10.201.538.097.732-.234.732-.518 0-.256-.01-.933-.012-1.828-2.991.649-3.623-1.442-3.623-1.442-.487-1.242-1.193-1.573-1.193-1.573-.975-.667.074-.652.074-.652 1.08.075 1.646 1.108 1.646 1.108.96 1.642 2.518 1.168 3.128.893.098-.695.378-1.169.684-1.437-2.386-.27-4.895-1.194-4.895-5.314 0-1.171.42-2.133 1.104-2.883-.11-.273-.481-1.367.106-2.845 0 0 .903-.29 2.956 1.1.877-.239 1.781-.36 2.69-.362.909.001 1.813.123 2.69.362 2.054-1.391 2.956-1.1 2.956-1.1.587 1.478.218 2.572.106 2.845.69.75 1.104 1.71 1.104 2.883 0 4.131-2.512 5.039-4.906 5.305.382.332.727.987.727 1.99 0 1.437-.013 2.597-.013 2.95 0 .287.192.621.74.516 4.271-1.425 7.347-5.452 7.347-10.2 0-5.937-4.812-10.75-10.75-10.75Z'
            fillRule='evenodd'
            clipRule='evenodd'
          ></path>
        </svg>
      </a>
      <Drawer.Root direction='right'>
        <Drawer.Trigger asChild>
          <Button variant='outline'>Step by step Guide</Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className='fixed inset-0 bg-black/40' />
          <Drawer.Content className='overflow-y-scroll overflow-x-hidden bg-white flex flex-col rounded-t-[10px] h-full w-full sm:w-[600px] mt-24 fixed bottom-0 right-0'>
            <div className='p-4 bg-white flex-1 h-full overflow-y-auto'>
              <div className='max-w-md mx-auto mt-10'>
                <Drawer.Title className='font-bold mb-4'>
                  How to export your Ghost blog contents
                </Drawer.Title>

                <div className='space-y-4 mb-5'>
                  <div>
                    <div className='mb-2'>
                      <h2 className='font-semibold'>Step 1</h2>
                      <p>
                        Navigate to your Ghost dashboard and click on the
                        settings icons
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
                        Navigate to your Hashnode settings and generate a
                        personal token.
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
                        Copy your publication ID from your dashboard URL, it's
                        the numbers in the URL
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
    </div>
  );
}
