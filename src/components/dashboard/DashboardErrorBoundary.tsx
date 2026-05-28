import { createRef } from "react"
import {
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardErrorBoundaryProps {
  children: ReactNode
  fallbackMessage?: string
  onReset?: () => void
}

interface DashboardErrorBoundaryState {
  hasError: boolean
}

export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  private errorRef = createRef<HTMLDivElement>()

  constructor(props: DashboardErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
  }

  static getDerivedStateFromError(): DashboardErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("DashboardErrorBoundary caught an error:", error, errorInfo)
  }

  componentDidUpdate(prevProps: DashboardErrorBoundaryProps, prevState: DashboardErrorBoundaryState): void {
    if (this.state.hasError && !prevState.hasError && this.errorRef.current) {
      this.errorRef.current.focus()
    }
  }

  resetErrorBoundary(): void {
    this.props.onReset?.()
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto max-w-md" aria-live="assertive" tabIndex={-1} ref={this.errorRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              <span id="dashboard-error-title">Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p id="dashboard-error-desc" className="mb-4 text-sm text-muted-foreground" aria-describedby="dashboard-error-title">
              {this.props.fallbackMessage ||
                "Something went wrong. Please try again."}
            </p>
            <Button onClick={this.resetErrorBoundary}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
