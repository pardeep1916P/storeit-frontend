"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp, signIn } from "@/lib/actions/user.actions";
import { OTPVerification } from "./OTPVerification";
import { toast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/PasswordInput";
import { SimplePasswordInput } from "@/components/SimplePasswordInput";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [signupData, setSignupData] = useState({ email: "", userId: "" });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "sign-up") {
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
          toast({
            title: "Error",
            description: "Please fill in all fields",
            variant: "destructive",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters long",
            variant: "destructive",
          });
          return;
        }

        const result = await signUp({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        });

        // Check if signup was successful and requires OTP verification
        if (result && result.userId) {
          setSignupData({ email: formData.email, userId: result.userId });
          setShowOTP(true);
          toast({
            title: "Success",
            description: "Account created! Please check your email for verification code.",
          });
        } else {
          // If no OTP required (development mode), redirect to dashboard
          toast({
            title: "Success",
            description: "Account created successfully!",
          });
          router.push("/");
        }
      } else {
        if (!formData.email || !formData.password) {
          toast({
            title: "Error",
            description: "Please fill in all fields",
            variant: "destructive",
          });
          return;
        }

        await signIn({
          email: formData.email,
          password: formData.password,
        });

        toast({
          title: "Success",
          description: "Signed in successfully!",
        });

        router.push("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show OTP verification if signup was successful
  if (showOTP) {
    return <OTPVerification email={signupData.email} userId={signupData.userId} />;
  }

  return (
    <div className="auth-form">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            {type === "sign-up" ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm sm:text-base">
            {type === "sign-up"
              ? "Create your account to get started"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {type === "sign-up" && (
                      <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              className="h-10 sm:h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand focus:border-2 transition-all duration-300 bg-white hover:border-gray-300 shadow-sm focus:shadow-md"
              required
            />
          </div>
          )}

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="h-10 sm:h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand focus:border-2 transition-all duration-300 bg-white hover:border-gray-300 shadow-sm focus:shadow-md"
              required
            />
          </div>

                   {type === "sign-up" ? (
                     <>
                       <PasswordInput
                         id="password"
                         label="Password"
                         placeholder="Enter your password"
                         value={formData.password}
                         onChange={(value) => setFormData({ ...formData, password: value })}
                         showStrength={true}
                         required
                       />
                       <PasswordInput
                         id="confirmPassword"
                         label="Confirm Password"
                         placeholder="Confirm your password"
                         value={formData.confirmPassword}
                         onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                         confirmPassword={formData.password}
                         required
                       />
                     </>
                   ) : (
                     <SimplePasswordInput
                       id="password"
                       label="Password"
                       placeholder="Enter your password"
                       value={formData.password}
                       onChange={(value) => setFormData({ ...formData, password: value })}
                       required
                     />
                   )}

                      <div className="flex justify-center">
              <Button
                type="submit"
                className="w-3/4 h-10 sm:h-12 bg-brand hover:bg-brand/90 text-white font-medium rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                            >
                {isLoading ? (
                  "Loading..."
                ) : type === "sign-up" ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
        </form>

        <div className="mt-4 sm:mt-6 text-center space-y-2 sm:space-y-3">
          {type === "sign-up" ? (
            <p className="text-gray-600 text-sm sm:text-base">
              Already have an account?{" "}
              <a href="/sign-in" className="text-brand hover:text-brand/80 font-medium transition-colors">
                Sign in
              </a>
            </p>
          ) : (
            <>
              <p className="text-gray-600 text-sm sm:text-base">
                Don't have an account?{" "}
                <a href="/sign-up" className="text-brand hover:text-brand/80 font-medium transition-colors">
                  Create one
                </a>
              </p>
              <p>
                <a href="/forgot-password" className="text-brand hover:text-brand/80 text-xs sm:text-sm font-medium transition-colors">
                  Forgot your password?
                </a>
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};
