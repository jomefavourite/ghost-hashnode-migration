'use client'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { getQueryClient } from '@/app/get-query-client'
import type * as React from 'react'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {


  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  )
}
