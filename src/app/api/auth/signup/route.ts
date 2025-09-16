import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body received:', { ...body, password: '***' });

    // ตรวจสอบ required fields
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

    // ตรวจสอบความยาวของ username
    if (body.username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // ตรวจสอบความยาวของ password
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // เตรียม payload ตาม backend API requirements
    const payload = {
      userName: body.username.trim(),
      password: body.password,
      fName: body.fName?.trim() || body.username.trim(),
      lName: body.lName?.trim() || 'User', // ใส่ default value แทน empty string
    };

    console.log('Sending payload to backend:', { ...payload, password: '***' });

    // เรียก backend API
    const response = await axios.post('http://141.11.156.52:3001/users', payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response data:', response.data);

    // ส่ง response กลับ
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('=== Signup API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

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
        // Backend ตอบกลับด้วย error status
        const status = error.response.status;
        const responseData = error.response.data;

        let errorMessage = 'เกิดข้อผิดพลาดจาก server';
        let errorDetails = responseData;

        // จัดการ error ตาม status code
        switch (status) {
          case 400:
            errorMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง';
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
            errorMessage = 'ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น';
            break;

          case 422:
            errorMessage = 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง';
            if (responseData?.message) {
              errorMessage = responseData.message;
            }
            break;

          case 500:
            errorMessage = 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่ในภายหลัง';
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
        // Network error - ไม่ได้รับ response
        console.error('Network error - no response received');
        return NextResponse.json(
          {
            success: false,
            error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อและลองใหม่',
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
        error: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ: ' + error.message,
        details: {
          type: 'UNKNOWN_ERROR',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
