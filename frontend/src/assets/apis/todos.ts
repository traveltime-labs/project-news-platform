// export interface Todo {
//   id: string
//   task: string
//   createdAt: string
// }

// const STORAGE_KEY = 'habit-tracker-todos'

// function readTodos(): Todo[] {
//   const raw = localStorage.getItem(STORAGE_KEY)
//   if (!raw) return []

//   try {
//     const parsed = JSON.parse(raw) as Todo[]
//     return Array.isArray(parsed) ? parsed : []
//   } catch {
//     return []
//   }
// }

// function writeTodos(todos: Todo[]) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
// }

// export async function fetchTodos(): Promise<Todo[]> {
//   return readTodos()
// }

// export async function createTodo(task: string): Promise<Todo> {
//   const next: Todo = {
//     id: crypto.randomUUID(),
//     task,
//     createdAt: new Date().toISOString(),
//   }

//   const todos = readTodos()
//   todos.unshift(next)
//   writeTodos(todos)
//   return next
// }
