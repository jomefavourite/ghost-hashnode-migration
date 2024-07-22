'use client';
import React, { useState } from 'react';
import cheerio from 'cheerio';
import { useMutation } from '@tanstack/react-query';
import { gql, request, GraphQLClient } from 'graphql-request';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GRAPHQL_ENDPOINT = 'https://gql.hashnode.com';
const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    // Authorization: `${process.env.NEXT_PUBLIC_HASHNODE_TOKEN}`,
    Authorization: ``,
  },
});

const UploadImageByURL = gql`
  mutation uploadImageByURL($input: UploadImageInput!) {
    uploadImageByURL(input: $input) {
      imageURL
    }
  }
`;

type CreateDraftInput = {
  title?: string;
  subtitle?: string;
  publicationId: string;
  contentMarkdown?: string;
  publishedAt?: string;
  coverImageOptions?: {
    coverImageURL: string;
    isCoverAttributionHidden?: boolean;
    coverImageAttribution?: string;
    coverImagePhotographer?: string;
    stickCoverToBottom?: boolean;
  };
  slug?: string;
  originalArticleURL?: string;
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  disableComments?: boolean;
  metaTags?: {
    title: string;
    description: string;
    image: string;
  };
  publishAs?: number;
  seriesId?: number;
  settings?: {
    enableTableOfContent: boolean;
    slugOverridden: boolean;
    activateNewsletter: boolean;
    delist: boolean;
  };
  coAuthors?: number[];
  draftOwner?: number;
};

const CreateDraft = gql`
  mutation CreateDraft($input: CreateDraftInput!) {
    createDraft(input: $input) {
      draft {
        id
      }
    }
  }
`;

function useUploadImage() {
  return useMutation({
    mutationKey: ['imageUpload'],
    mutationFn: async (url) => {
      const data = await client.request(UploadImageByURL, { url: url });
      return data;
    },
  });
}

function useCreateDraft() {
  return useMutation({
    mutationKey: ['createDraft'],
    mutationFn: async (params: CreateDraftInput) => {
      const data = await client.request(CreateDraft, { input: params });
      return data;
    },
  });
}

const Upload = () => {
  const [publicationId, setPublicationId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const { mutateAsync } = useUploadImage();
  const { mutateAsync: draftMutation } = useCreateDraft();
  // Original HTML string
  const html = `<p>hsndsjkdmks</p><figure class="kg-card kg-image-card kg-card-hascaption"><img src="https://digitalpress.fra1.cdn.digitaloceanspaces.com/27bts4j/2024/01/world.png" class="kg-image" alt="sdsdsd" loading="lazy" width="2000" height="1000"><figcaption><span style="white-space: pre-wrap;">sksdjsd</span></figcaption></figure><figure class="kg-card kg-image-card kg-card-hascaption"><img src="https://digitalpress.fra1.cdn.digitaloceanspaces.com/27bts4j/2024/01/world.png" class="kg-image" alt="" loading="lazy" width="2000" height="1000"><figcaption><span style="white-space: pre-wrap;">hdjslds</span></figcaption></figure><figure class="kg-card kg-image-card"><img src="https://digitalpress.fra1.cdn.digitaloceanspaces.com/27bts4j/2024/01/world.png" class="kg-image" alt="" loading="lazy" width="2000" height="1000"></figure><p>sjdksjslds</p><hr><hr>`;

  // New URL to replace the old ones
  const newUrl =
    'https://cdn.hashnode.com/res/hashnode/image/upload/v1721205645152/f22a3400-d385-485d-9b82-7114fee610bc.jpeg';

  // Function to replace URLs
  function replaceImgUrls(html) {
    const $ = cheerio.load(html);
    if ($('img').length === 0) {
      return html;
    }
    $('img').each((i, img) => {
      (async () => {
        const newURL = await mutateAsync($(img).attr('src'));
        console.log('New URL:', newURL);
        console.log('Original URL:', $(img).attr('src'));
        // $(img).attr('src', newUrl);
      })();
      // const newURL = await mutateAsync($(img).attr('src'));
      // console.log('New URL:', newURL);
      // console.log('Original URL:', $(img).attr('src'));
      // $(img).attr('src', newUrl);
    });
    return $.html();
  }

  // Replacing the URLs
  // const updatedHtml = replaceImgUrls(html);
  // console.log('Updated HTML:', updatedHtml);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          console.log(jsonData, 'jsonData');
          setData(jsonData);
          setError(null); // Clear any previous errors
        } catch (err) {
          setError('Error parsing JSON');
          setData(null);
        }
      };
      reader.onerror = () => {
        setError('Error reading file');
        setData(null);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid JSON file');
      setData(null);
    }
  };

  const handleUpload = () => {
    const posts = data.db[0].data.posts;

    // const updatedContent = replaceImgUrls(post.html);
    posts.forEach(async (post) => {
      draftMutation({
        title: post.title,
        slug: post.slug,
        contentMarkdown: post.html,
        publicationId: publicationId,
        tags: [],
        coverImageOptions: {
          coverImageURL: post.feature_image,
        },
        publishedAt: post.published_at,
      });
    });
  };

  return (
    <div className='border rounded-md p-4 mt-16 max-w-lg mx-auto'>
      <h2 className='font-bold text-2xl text-center'>
        Migrate Ghost blog to Hashnode
      </h2>
      <div className='grid gap-4 mt-8'>
        <div className='grid w-full  items-center gap-1.5'>
          <Label htmlFor='publicationId'>Publication ID</Label>
          <Input
            type='text'
            required
            id='publicationId'
            placeholder='Publication ID'
            className='w-full'
            onChange={(e) => setPublicationId(e.target.value)}
          />
        </div>
        <div className='grid w-full  items-center gap-2'>
          <Label htmlFor='file'>Upload Ghost Export File</Label>
          <div className='flex items-center gap-2'>
            <Input
              id='file'
              required
              type='file'
              accept='application/json'
              className='w-full'
              placeholder='Choose a file'
              onChange={handleFileChange}
            />
          </div>
        </div>
        <Button onClick={handleUpload}>Upload to Draft</Button>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {/* {data && (
        <div>
          <h1>Loaded JSON Data:</h1>
          <button onClick={handleUpload}>Upload to Draft</button>
        </div>
      )} */}
    </div>
  );
};

export default Upload;

function UploadIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
      <polyline points='17 8 12 3 7 8' />
      <line x1='12' x2='12' y1='3' y2='15' />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  );
}
