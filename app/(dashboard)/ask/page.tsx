'use client'

import { Send, Loader, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { chatHistory, suggestedQuestions } from '@/lib/mock-data'
import { useState } from 'react'

export default function AskPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = () => {
    if (message.trim()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setMessage('')
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ask LOOP</h1>
        <p className="mt-1 text-muted-foreground">Ask our AI assistant about your customer feedback</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-border bg-card p-6 mb-4">
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Start by asking a question about your feedback</p>
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Suggested Questions</h2>
            <div className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(q)}
                  className="w-full text-left rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h3 className="font-semibold text-sm mb-2">💡 Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ask about trends and patterns</li>
              <li>• Request sentiment analysis</li>
              <li>• Explore theme relationships</li>
              <li>• Get actionable insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
