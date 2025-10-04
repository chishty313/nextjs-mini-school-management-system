"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  estimatedRelease?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon,
  features = [],
  estimatedRelease,
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
            {icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
            <p className="text-xl text-gray-600 mt-2">{description}</p>
          </div>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              We&apos;re Working on It!
            </CardTitle>
            <CardDescription className="text-lg">
              This feature is currently under development and will be available
              soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Preview */}
            {features.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  What to Expect
                </h3>
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Release Info */}
            {estimatedRelease && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Estimated Release:</strong> {estimatedRelease}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Stay tuned for updates! We&apos;re constantly improving the
            platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
