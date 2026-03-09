"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught error in [${this.props.name || "Unknown"}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full p-6 border border-destructive/20 bg-destructive/5 rounded-xl flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-destructive/10 rounded-full text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-foreground">
              משהו השתבש ב{this.props.name || "תצוגה"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              אירעה שגיאה בטעינת הרכיב. ניתן לנסות לרענן או להמשיך להשתמש בשאר חלקי המערכת.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            נסה שוב
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
