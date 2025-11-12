import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <p className="text-2xl font-medium text-gray-700 dark:text-gray-300 mt-4">Page Not Found</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-6 inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Go back home</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
