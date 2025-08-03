"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyOTP, resendOTP } from "@/lib/actions/user.actions";
import { toast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  email: string;
  userId: string;
}

export const OTPVerification = ({ email, userId }: OTPVerificationProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyOTP({ email, otp });

      toast({
        title: "Success",
        description: "Email verified successfully!",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      await resendOTP({ email });

      toast({
        title: "Success",
        description: "Verification code sent to your email",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification code to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <Button
            variant="outline"
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="text-sm"
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 