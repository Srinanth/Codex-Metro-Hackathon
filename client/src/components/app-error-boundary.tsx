import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorPage } from "@/pages/error-page";

type Props = { children: ReactNode };
type State = { failed: boolean };
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Application error", error, info); }
  render() { return this.state.failed ? <ErrorPage kind="server" /> : this.props.children; }
}
