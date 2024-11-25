import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import builderConfig from '@config/builder'
import { resolveBuilderContent } from '@lib/resolve-builder-content'
import { useThemeUI } from '@theme-ui/core'
import Link from 'next/link'
import { Themed } from '@theme-ui/mdx'
import { getLayoutProps } from '@lib/get-layout-props'
import DefaultErrorPage from 'next/error'

builder.init(builderConfig.apiKey)

const categories = [
  [
    {
      title: "The Great Adventure",
      description: "A thrilling novel that takes readers on an epic journey across the seas."
    },
    {
      title: "Mystery of the Lost Treasure",
      description: "A gripping tale of a hidden treasure and the pursuit of its discovery."
    }
  ],
  [
    {
      title: "Tech Innovations 2024",
      description: "An insightful look into the latest technological breakthroughs and trends for 2024."
    },
    {
      title: "AI and the Future of Work",
      description: "Exploring how artificial intelligence is transforming the job market and work culture."
    }
  ],
  [
    {
      title: "Healthy Living Guide",
      description: "A comprehensive guide to living a healthy lifestyle with tips on diet, exercise, and mindfulness."
    },
    {
      title: "Mental Health and Well-being",
      description: "Strategies for improving mental health, reducing stress, and maintaining emotional balance."
    }
  ]
];

export async function getStaticProps({
  params,
  locale,
}: GetStaticPropsContext<{ path: string[] }>) {
  const page = await resolveBuilderContent('page', {
    locale,
    urlPath: '/' + (params?.path?.join('/') || ''),
  })
  return {
    props: {
      page,
      locale,
      ...(await getLayoutProps()),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  return {
    paths: [],
    fallback: true,
  }
}

export default function Path({
  page,
  locale,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const { theme } = useThemeUI()
  const isPreviewing = useIsPreviewing()
  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />
  }

  const { title, description, image } = page?.data! || {}

  return (
    <div>
      {title && (
        <NextSeo
          title={title}
          description={description}
          openGraph={{
            type: 'website',
            title,
            description,
            locale,
            ...(image && {
              images: [
                {
                  url: image,
                  width: 800,
                  height: 600,
                  alt: title,
                },
              ],
            }),
          }}
        />
      )}
      <BuilderComponent
        options={{ includeRefs: true }}
        model="page"
        data={{ theme, categories, category: 1 }}
        content={page}
        renderLink={(props: any) => {
          // nextjs link doesn't handle hash links well if it's on the same page (starts with #)
          if (props.target === '_blank' || props.href?.startsWith('#')) {
            return <Themed.a {...props} />
          }
          return <Themed.a {...props} as={Link} />
        }}
      />
    </div>
  )
}
