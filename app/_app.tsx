// app/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import EditorLayout from './editor/[id]/layout';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <EditorLayout>
            <Component {...pageProps} />
        </EditorLayout>
    );
}

export default MyApp;