import type { TodoItem } from '../types/game'

export function TodoList({ todos }: { todos: TodoItem[] }) {
  return (
    <div className="rounded-xl bg-panel-light/50 border border-panel-border p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-3">To Do List</h3>
      <ul className="space-y-3">
        {todos.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className={`text-sm font-semibold ${t.done ? 'text-muted line-through' : 'text-white'}`}>
                {t.title}
              </div>
              <div className="text-[11px] text-muted">{t.description}</div>
            </div>
            {!t.done && (
              <button
                type="button"
                className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500"
              >
                Go
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
