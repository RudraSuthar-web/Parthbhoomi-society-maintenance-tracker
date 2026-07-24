import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global JS error listener
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fff; color: red; font-family: monospace; border: 4px solid red; margin: 20px; text-align: left;">
        <h2 style="margin-top: 0;">Global JS Error Caught</h2>
        <pre style="white-space: pre-wrap; font-weight: bold;">${event.message}\nat ${event.filename}:${event.lineno}:${event.colno}</pre>
        <pre style="white-space: pre-wrap;">${event.error ? event.error.stack : 'No stack trace available'}</pre>
      </div>
    `;
  }
});

// Global Promise rejection listener
window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fff; color: red; font-family: monospace; border: 4px solid red; margin: 20px; text-align: left;">
        <h2 style="margin-top: 0;">Global Promise Rejection Caught</h2>
        <pre style="white-space: pre-wrap;">${event.reason ? (event.reason.stack || event.reason.toString()) : 'No reason available'}</pre>
      </div>
    `;
  }
});

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fff', color: '#000', fontFamily: 'monospace', textAlign: 'left', border: '4px solid red', margin: '20px' }}>
          <h2 style={{ color: 'red', marginTop: 0 }}>React Render Crash Caught</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.stack}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#555' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
