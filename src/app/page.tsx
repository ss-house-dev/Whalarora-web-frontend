'use client';

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Welcome to Whalarora
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Discover Whalarora, your premier trading platform for real-time market insights, secure transactions, and seamless trading experiences.
        </p>
        <Button
          onClick={() => router.push('/auth/sign-in')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-300"
        >
          Join Whalarora Now
        </Button>
      </div>
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Real-Time Data</h3>
          <p className="text-gray-300">Access live market updates to make informed trading decisions.</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
          <p className="text-gray-300">Trade with confidence using our state-of-the-art security protocols.</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">User-Friendly Interface</h3>
          <p className="text-gray-300">Navigate effortlessly with our intuitive and responsive design.</p>
        </div>
      </div>
    </div>
  );
}