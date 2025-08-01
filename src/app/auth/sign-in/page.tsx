'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';

// Define type for form data
interface FormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    age: number;
}

export default function FormPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    // Handle form submission
    const onSubmit: SubmitHandler<FormData> = (data) => {
        alert(JSON.stringify(data));
        console.log(data);
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 text-center">
                    Join Whalarora
                </h1>
                <p className="text-lg text-gray-300 mb-8">
                    Create your account to start trading with confidence
                </p>
        
                <div className="bg-gray-800 max-w-md mx-auto p-8 rounded-lg shadow-lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Email
                            </label>
                            <Input
                                {...register('email', {
                                    required: true,
                                    maxLength: 50,
                                    pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$/i,
                                })}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="Enter your email"
                            />
                            {errors.email?.type === 'required' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ This field is required
                                </p>
                            )}
                            {errors.email?.type === 'maxLength' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ Email cannot exceed 50 characters
                                </p>
                            )}
                            {errors.email?.type === 'pattern' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ Invalid email address
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                First Name
                            </label>
                            <Input
                                {...register('firstName', {
                                    required: true,
                                    maxLength: 20,
                                    pattern: /^[A-Za-z]+$/i,
                                })}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="Enter your first name"
                            />
                            {errors.firstName?.type === 'required' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ This field is required
                                </p>
                            )}
                            {errors.firstName?.type === 'maxLength' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ First name cannot exceed 20 characters
                                </p>
                            )}
                            {errors.firstName?.type === 'pattern' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ Alphabetical characters only
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Last Name
                            </label>
                            <Input
                                {...register('lastName', {
                                    required: true,
                                    maxLength: 20,
                                    pattern: /^[A-Za-z]+$/i,
                                })}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="Enter your last name"
                            />
                            {errors.lastName?.type === 'required' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ This field is required
                                </p>
                            )}
                            {errors.lastName?.type === 'maxLength' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ Last name cannot exceed 20 characters
                                </p>
                            )}
                            {errors.lastName?.type === 'pattern' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ Alphabetical characters only
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Age
                            </label>
                            <Input
                                {...register('age', {
                                    required: true,
                                    min: 18,
                                    max: 99,
                                })}
                                type="number"
                                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="Enter your age"
                            />
                            {errors.age?.type === 'required' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ This field is required
                                </p>
                            )}
                            {errors.age?.type === 'min' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ You must be at least 18 years old
                                </p>
                            )}
                            {errors.age?.type === 'max' && (
                                <p className="mt-1 text-sm text-red-400">
                                    ⚠ You must be under 99 years old
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-5 rounded-lg text-md tracking-wide transition duration-300 active:scale-95"
                        >
                            Start Trading with Whalarora
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}