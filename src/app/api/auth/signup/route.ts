import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body received:', { ...body, password: '***' });

    // Check required fields
    if (!body.username || !body.password) {
      return NextResponse.json(
        {
          error: 'Username and password are required',
          details: {
            username: !body.username ? 'Username is required' : null,
            password: !body.password ? 'Password is required' : null,
          },
        },
        { status: 400 }
      );
    }

    // Check password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Prepare payload according to backend API requirements
    const payload = {
      userName: body.username.trim(),
      password: body.password,
      fName: body.fName?.trim() || body.username.trim(),
      lName: body.lName?.trim() || 'User', // Set default value instead of empty string
    };

    console.log('Sending payload to backend:', { ...payload, password: '***' });

    // Call backend API
    const response = await axios.post('http://141.11.156.52:3001/users', payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response data:', response.data);

    // Send response back
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('=== Signup API Error ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error('- Status:', error.response?.status);
      console.error('- Status text:', error.response?.statusText);
      console.error('- Response data:', error.response?.data);
      console.error('- Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data ? JSON.parse(error.config.data) : null,
      });

      if (error.response) {
        // Backend responded with error status
        const status = error.response.status;
        const responseData = error.response.data;

        let errorMessage = 'Server error occurred';
        const errorDetails = responseData; // Changed to const

        // Handle errors by status code
        switch (status) {
          case 400:
            errorMessage = 'Invalid data provided';
            if (responseData?.message) {
              errorMessage = responseData.message;
            } else if (responseData?.error) {
              if (Array.isArray(responseData.error)) {
                errorMessage = responseData.error.join(', ');
              } else {
                errorMessage = responseData.error;
              }
            }
            break;

          case 409:
            errorMessage = 'This username is already taken. Please choose a different username';
            break;

          case 422:
            errorMessage = 'Data is incomplete or invalid';
            if (responseData?.message) {
              errorMessage = responseData.message;
            }
            break;

          case 500:
            errorMessage = 'System error occurred. Please try again later';
            break;

          default:
            if (responseData?.message) {
              errorMessage = responseData.message;
            } else if (responseData?.error) {
              errorMessage = Array.isArray(responseData.error)
                ? responseData.error.join(', ')
                : responseData.error;
            }
        }

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            details: errorDetails,
            status: status,
          },
          { status: status }
        );
      } else if (error.request) {
        // Network error - no response received
        console.error('Network error - no response received');
        return NextResponse.json(
          {
            success: false,
            error: 'Unable to connect to server. Please check your connection and try again',
            details: {
              type: 'NETWORK_ERROR',
              message: 'No response from server',
            },
          },
          { status: 503 }
        );
      }
    }

    // Generic error
    console.error('Generic error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'An unknown error occurred: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
        details: {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
