// app/api/auth/password-reset-email/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://nsitf-be.geniusexcel.tech";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    console.log("Processing password reset with token");
    // Parse JSON from request
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("Forwarding password reset email request for:", email);

    // Forward as URL-encoded (as per API docs)
    const formData = new URLSearchParams();
    formData.append("email", email);

    const response = await fetch(
      `${BACKEND_URL}/api/auth/password-reset-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    console.log("Backend response status:", response.status);

    const data = await response.json();
    console.log("Backend response data:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error in password-reset-email:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================

// app/api/auth/reset-password/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// const BACKEND_URL = 'https://nsitf-be.geniusexcel.tech';

// export async function POST(request: NextRequest) {
//   try {
//     // Get token from query params
//     const { searchParams } = new URL(request.url);
//     const token = searchParams.get('token');

//     if (!token) {
//       return NextResponse.json(
//         { error: 'Reset token is required' },
//         { status: 400 }
//       );
//     }

//     console.log('Processing password reset with token');

//     // Parse JSON from request
//     const body = await request.json();
//     const { password1, password2 } = body;

//     if (!password1 || !password2) {
//       return NextResponse.json(
//         { error: 'Both password fields are required' },
//         { status: 400 }
//       );
//     }

//     console.log('Passwords received, forwarding to backend...');

//     // Forward as URL-encoded (as per API docs)
//     const formData = new URLSearchParams();
//     formData.append('password1', password1);
//     formData.append('password2', password2);

//     const backendUrl = `${BACKEND_URL}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

//     const response = await fetch(backendUrl, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: formData.toString(),
//     });

//     console.log('Backend response status:', response.status);

//     const data = await response.json();
//     console.log('Backend response data:', data);

//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.error('Proxy error in reset-password:', error);
//     return NextResponse.json(
//       { error: 'Failed to reset password', details: String(error) },
//       { status: 500 }
//     );
//   }
// }
