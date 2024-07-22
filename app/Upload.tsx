'use client';
import React, { useEffect, useState } from 'react';
import { gql, GraphQLClient } from 'graphql-request';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

const GRAPHQL_ENDPOINT = 'https://gql.hashnode.com';
const client = new GraphQLClient(GRAPHQL_ENDPOINT);

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

const Upload = () => {
  const [data, setData] = useState<null | any>(null);
  const [error, setError] = useState<null | string>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    mode: 'onBlur',
    defaultValues: {
      publicationId: '',
      token: '',
    },
  });

  useEffect(() => {
    if (progress === 100) {
      setIsLoading(false);
      setIsComplete(true);
    }
  }, [progress]);

  const handleFileChange = (event: React.ChangeEvent) => {
    // @ts-ignore
    const file = event.target?.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const jsonData = JSON.parse(e.target?.result);
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

  const onSubmit = (values: any) => {
    const posts = data?.db[0]?.data?.posts;
    setIsLoading(true);

    posts.forEach(async (post: any) => {
      await client
        .setHeader('Authorization', values.token)
        .request(CreateDraft, {
          input: {
            title: post.title,
            slug: post.slug,
            contentMarkdown: post.html,
            publicationId: values.publicationId,
            tags: [],
            coverImageOptions: {
              coverImageURL: post.feature_image,
            },
            publishedAt: post.published_at,
          },
        })
        .then(() => {
          setProgress((prev) => {
            return prev + 100 / posts.length;
          });
        });
    });
  };

  return (
    <div className='border rounded-md p-4 mt-16 max-w-lg mx-auto'>
      {isComplete ? (
        <div className='text-center'>
          <Image
            src='/success.png'
            alt='logo'
            width={150}
            height={150}
            className='mx-auto'
          />
          <p>
            Drafts created! Check your draft{' '}
            <a href='https://hn.new/' className='underline'>
              here.
            </a>{' '}
          </p>
        </div>
      ) : (
        <div>
          <h2 className='font-bold text-2xl text-center'>
            Migrate Ghost blog to Hashnode
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4 mt-8'>
            <div className='grid w-full  items-center gap-1.5'>
              <Label htmlFor='publicationId'>Publication ID</Label>
              <Input
                type='text'
                disabled={isLoading}
                required
                id='publicationId'
                placeholder='Publication ID'
                {...register('publicationId', {
                  required: {
                    value: true,
                    message: 'Publication ID is required',
                  },
                  maxLength: {
                    message: 'Max length is 24',
                    value: 24,
                  },
                })}
                className='w-full'
                autoComplete='off'
              />
              {formState.errors.publicationId && (
                <span className='text-[12px] text-red-500'>
                  {formState.errors.publicationId.message}
                </span>
              )}
            </div>
            <div className='grid w-full  items-center gap-1.5'>
              <Label htmlFor='token'>Personal Token</Label>
              <Input
                type='text'
                disabled={isLoading}
                required
                id='token'
                placeholder='Personal Token'
                className='w-full'
                {...register('token', {
                  required: {
                    value: true,
                    message: 'Token is required',
                  },
                  maxLength: {
                    message: 'Max length is 36',
                    value: 36,
                  },
                })}
              />
              {formState.errors.token && (
                <span className='text-[12px] text-red-500'>
                  {formState.errors.token.message}
                </span>
              )}
            </div>
            <div className='grid w-full  items-center gap-2'>
              <Label htmlFor='file'>Upload Ghost Export File</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='file'
                  disabled={isLoading}
                  required
                  type='file'
                  accept='application/json'
                  className='w-full'
                  placeholder='Choose a file'
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <Button disabled={isLoading} type='submit'>
              Upload to Draft
            </Button>
          </form>
          {error && <div style={{ color: 'red' }}>{error}</div>}

          {isLoading && (
            <div className='mt-5'>
              <p className='text-center'>Loading {progress}%</p>
              <Progress value={progress} className='w-full' />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
