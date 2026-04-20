export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-[75%]">
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
    </div>
  )
}
