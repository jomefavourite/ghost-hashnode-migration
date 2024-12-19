'use client';
import React, { useEffect, useState } from 'react';
import { gql, GraphQLClient } from 'graphql-request';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useForm, useWatch } from 'react-hook-form';
import Image from 'next/image';
import isUrl from 'is-url';
import TurndownService from 'turndown';

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

const UploadImageByURL = gql`
  mutation UploadImageByURL($url: URL!) {
    uploadImageByURL(input: { url: $url }) {
      imageURL
    }
  }
`;

type UploadImageResponse = {
  uploadImageByURL: {
    imageURL: string;
  };
};

const preprocessHtml = async (
  htmlString: string,
  ghostUrlValue: string,
  tokenValue: string
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const images = doc.querySelectorAll('img');

  // Process each image asynchronously
  Array.from(images).forEach(async (img) => {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || '';

    if (src && src.includes('__GHOST_URL__')) {
      const imageURL = src.replace('__GHOST_URL__', ghostUrlValue);

      try {
        const response = await client
          .setHeader('Authorization', tokenValue)
          .request<UploadImageResponse>(UploadImageByURL, { url: imageURL });

        if (response?.uploadImageByURL?.imageURL) {
          // Replace the src in the original HTML with the resolved URL
          img.setAttribute('src', response.uploadImageByURL.imageURL);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  });

  return doc.body.innerHTML; // Return the processed HTML
};

const Upload = () => {
  const [data, setData] = useState<null | any>(null);
  const [error, setError] = useState<null | string>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { register, handleSubmit, formState, control } = useForm({
    mode: 'onBlur',
    defaultValues: {
      publicationId: '',
      token: '',
      ghostUrl: '',
    },
  });

  const ghostUrlValue = useWatch({
    control,
    name: 'ghostUrl',
  });
  const tokenValue = useWatch({
    control,
    name: 'token',
  });

  const turndownService = new TurndownService();

  // Add a custom rule for <script> tags
  turndownService.addRule('scriptToMarkdown', {
    filter: 'script',
    replacement: (content: any, node: any) => {
      const src = node.getAttribute('src');
      if (src.includes('gist.github.com') && src.endsWith('.js')) {
        return `%[${src.slice(0, -3)}]`; // Remove last 3 characters ('.js')
      }
      return src ? `%[${src}]` : '';
    },
  });

  // Add a custom rule for <a> tags
  turndownService.addRule('anchorReplace', {
    filter: 'a',
    replacement: (content: any, node: any) => {
      const href = node.getAttribute('href');
      if (href && href.includes('__GHOST_URL__')) {
        return `[${content}](${href.replace('__GHOST_URL__', ghostUrlValue)})`;
      }
      return `[${content}](${href})`;
    },
  });

  // Add a custom rule for <img> tags
  turndownService.addRule('imageReplace', {
    filter: 'img',
    replacement: (content: any, node: any) => {
      const src = node.getAttribute('src');
      const alt = node.getAttribute('alt') || '';

      // const imageURL =
      //   src && src.includes('__GHOST_URL__')
      //     ? src.replace('__GHOST_URL__', ghostUrlValue)
      //     : src;

      // const response = await client
      //   .setHeader('Authorization', tokenValue)
      //   .request(UploadImageByURL, { url: imageURL });

      // // console.log(response, 'response Image');

      // return response?.uploadImageByURL
      //   ? `![${alt}](${response?.uploadImageByURL?.imageURL})`
      //   : imageURL;

      // if (src && src.includes('__GHOST_URL__')) {
      //   return `![${alt}](${src.replace('__GHOST_URL__', ghostUrlValue)})`;
      // }
      return `![${alt}](${src})`;
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
          // console.log(jsonData, 'jsonData');
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
    const posts = data?.db[0]?.data?.posts.filter(
      (post: any) => post.type === 'post'
    );
    // console.log(posts, 'posts');
    // return;
    setIsLoading(true);

    posts.forEach(async (post: any) => {
      const html = await preprocessHtml(
        post.html,
        values.ghostUrl,
        values.token
      );
      const markdown = turndownService.turndown(html);

      const imageURL = isUrl(post.feature_image)
        ? post.feature_image
        : post.feature_image?.includes('__GHOST_URL__')
        ? post.feature_image.replace('__GHOST_URL__', values.ghostUrl)
        : '';

      const response = await client
        .setHeader('Authorization', tokenValue)
        .request<UploadImageResponse>(UploadImageByURL, { url: imageURL });

      const hashnodeImageURL = response.uploadImageByURL?.imageURL || imageURL;

      // console.log(markdown, 'markdown');
      // return;
      await client
        .setHeader('Authorization', values.token)
        .request(CreateDraft, {
          input: {
            title: post.title,
            slug: post.slug,
            contentMarkdown: markdown,
            publicationId: values.publicationId,
            tags: [],
            coverImageOptions: {
              coverImageURL:
                hashnodeImageURL.length > 0 ? hashnodeImageURL : null,
            },
            publishedAt: post.published_at,
            originalArticleURL: post.canonical_url,
          },
        })
        .then(() => {
          setProgress((prev) => {
            return Math.round(prev + 100 / posts.length);
          });
        })
        .catch((err) => console.log(err));
      // .finally(() => {
      //   setProgress((prev) => {
      //     return 100;
      //   });
      // });
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
              <Label htmlFor='ghostUrl'>Your Ghost Blog URL</Label>
              <Input
                type='text'
                disabled={isLoading}
                required
                id='ghostUrl'
                placeholder='https://yourblog.com'
                {...register('ghostUrl', {
                  required: {
                    value: true,
                    message: 'Ghost Blog URL is required',
                  },
                })}
                className='w-full'
                autoComplete='off'
              />
              {formState.errors.ghostUrl && (
                <span className='text-[12px] text-red-500'>
                  {formState.errors.ghostUrl.message}
                </span>
              )}
            </div>
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
