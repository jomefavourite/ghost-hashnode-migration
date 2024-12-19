import Image from 'next/image';
import Upload from './Upload';
import Guide from '@/components/guide';

export default function Home() {
  return (
    <main className=' min-h-screen flex flex-col justify-between py-5 px-5 md:px-20'>
      <div>
        <div className='flex flex-col sm:flex-row gap-3 justify-between items-center'>
          <div className='flex gap-2 items-center font-bold'>
            <Image src='/logo.svg' alt='logo' width={150} height={150} />/{' '}
            <span className=' text-lg'>Ghost</span>
          </div>
          <Guide />
        </div>

        <Upload />

        <div className='max-w-lg mx-auto mt-16'>
          <h2 className='font-bold'>Limitations</h2>

          <ul>
            <li>
              - Caption on images from Ghost would appear as text on your draft
            </li>
            <li>
              - Tags from Ghost don't get added to your Hashnode blog draft
            </li>
          </ul>
        </div>
      </div>

      <p className=' bottom-3 text-center mx-auto w-full left-0 p-5 text-sm'>
        Built by{' '}
        <a href='https://hashnode.com/@Favourite' className='underline'>
          Favourite Jome
        </a>{' '}
        - Customer Success Engineer at Hashnode
      </p>
    </main>
  );
}
