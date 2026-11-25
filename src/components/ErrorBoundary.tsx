import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Произошла непредвиденная ошибка.',
    };
  }

  override componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary:', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#18181B] border border-white/10 p-6 text-center space-y-4">
            <h1 className="font-display text-2xl font-bold text-[#FFD400]">
              Не удалось выполнить действие
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Возникла ошибка при обращении к базе данных или загрузке интерфейса. Попробуйте
              обновить страницу.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#FFD400] text-[#111111] text-sm font-semibold hover:bg-[#ffe033] transition-colors cursor-pointer"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
