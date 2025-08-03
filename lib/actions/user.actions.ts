"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Development mode - bypass authentication when AWS is not configured
const isDevelopmentMode = true; // Set to true for development, false for production

const getAuthToken = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get('aws-session');
  return session?.value;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const signUp = async ({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    if (isDevelopmentMode) {
      // Development mode - mock signup with OTP flow
      const mockUser = {
        id: `dev-user-${Date.now()}`,
        email,
        username,
        token: 'mock-jwt-token',
      };
      
      // In development mode, simulate OTP verification flow
      return {
        userId: mockUser.id,
        email: email,
        message: 'Account created successfully. Please check your email for verification code.'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    handleError(error, "Failed to sign up");
  }
};

export const verifyOTP = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  try {
    if (isDevelopmentMode) {
      // Development mode - mock OTP verification
      const mockUser = {
        id: `dev-user-${Date.now()}`,
        email,
        username: 'John Doe',
        token: 'mock-jwt-token',
      };
      
      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('aws-session', mockUser.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
      });
      
      return mockUser;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify OTP');
    }

    const result = await response.json();
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('aws-session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return result;
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const resendOTP = async ({
  email,
}: {
  email: string;
}) => {
  try {
    if (isDevelopmentMode) {
      // Development mode - mock resend OTP
      return { message: 'Verification code sent to your email' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resend OTP');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    handleError(error, "Failed to resend OTP");
  }
};

export const signIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    if (isDevelopmentMode) {
      // Development mode - mock signin
      const mockUser = {
        id: `dev-user-${Date.now()}`,
        email,
        username: 'John Doe',
        token: 'mock-jwt-token',
      };
      
      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('aws-session', mockUser.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
      });
      
      return mockUser;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }

    const result = await response.json();
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('aws-session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return result;
  } catch (error) {
    handleError(error, "Failed to sign in");
  }
};

export const forgotPassword = async ({
  email,
}: {
  email: string;
}) => {
  try {
    if (isDevelopmentMode) {
      // Development mode - mock forgot password
      return { message: 'Password reset code sent to your email' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send reset code');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    handleError(error, "Failed to send reset code");
  }
};

export const resetPassword = async ({
  email,
  resetCode,
  newPassword,
}: {
  email: string;
  resetCode: string;
  newPassword: string;
}) => {
  try {
    if (isDevelopmentMode) {
      // Development mode - mock password reset
      return { message: 'Password reset successfully' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, resetCode, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    handleError(error, "Failed to reset password");
  }
};

export const signOut = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('aws-session');
    redirect('/sign-in');
  } catch (error) {
    handleError(error, "Failed to sign out");
  }
};

export const getCurrentUser = async () => {
  try {
    if (isDevelopmentMode) {
      // Development mode - return mock user
      return {
        id: 'dev-user-1',
        email: 'john.doe@example.com',
        username: 'John Doe',
      };
    }

    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};
